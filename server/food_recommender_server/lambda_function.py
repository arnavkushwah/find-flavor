import json
import boto3
import random
import requests
import time
from openai import OpenAI
from bs4 import BeautifulSoup

OPEN_AI_API_KEY = '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'
open_ai_client = OpenAI(
    api_key=OPEN_AI_API_KEY,
)

YELP_API_KEY = "nDOW7jlrZo3vKrRtI4rkVlX9I3_kqWWz0nRSXAL0a885i8GoilWCVrPHWRmZIa6_vhe8THxyO9Iu3ZFrJQKZyxNUXsBh_Wjq7K903cEr8OOIiG_zjcjsYa81Mbj3WXYx"

dynamodb_client = boto3.client('dynamodb')
dynamodb = boto3.resource("dynamodb")
reviews_dynamodb_table_name = 'food-recommender-reviews'
reviews_dynamodb_table = dynamodb.Table(reviews_dynamodb_table_name)
gpt_response_dynamodb_table_name = 'food-recommender-gpt-response'
gpt_response_dynamodb_table = dynamodb.Table(gpt_response_dynamodb_table_name)
yelp_api_business_search_response_dynamodb_table_name = 'yelp-api-business-search'
yelp_api_business_search_response_dynamodb_table = dynamodb.Table(yelp_api_business_search_response_dynamodb_table_name)

valid_user_agents = ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36', 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.6312.80 Mobile Safari/537.36', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3.1 Mobile/15E148 Safari/604.1']
valid_referers = ['https://www.google.com/', 'https://www.bing.com/']

def generate_headers():
    # Add these headers to make it look like a legitmate request
    headers = {
        'User-agent': random.choice(valid_user_agents),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
        'Accept-Encoding': 'gzip',
        'Accept-Language': 'en-US,en;q=0.9,es;q=0.8',
        'Upgrade-Insecure-Requests': '1',
        'Referer': random.choice(valid_referers),
    }
    return headers

def scrape_yelp_reviews(business_id, num_pages=1):
    # Check if results are in cache
    cache_reviews = reviews_dynamodb_table.get_item(Key={'restaurant': business_id})
    if (cache_reviews.get('Item') != None):
        # TODO: add time check and if cache is too old, scrape again
        return cache_reviews.get('Item').get('reviews')

    reviews = []
    for page in range(0, num_pages):
      offset = '' if page == 0 else '?start=' + str(page) + '0'
      # Sleep for a random duration between 0 and 0.5 seconds
      time.sleep(random.random() / 2)
      r = requests.get('https://www.yelp.com/biz/' + business_id + offset, params = {}, headers = {})
      r.raise_for_status()
      soup = BeautifulSoup(r.text,'html.parser')
      all_reviews_html = soup.find_all("li",{"class":"css-1q2nwpv"})

      for i in range(0,len(all_reviews_html)):
        try:
          curr_review = all_reviews_html[i].find("span",{"class":"raw__09f24__T4Ezm"}).text
          if (curr_review != None):
            reviews.append(curr_review)
        except:
          continue
    # Cache results
    reviews_dynamodb_table.put_item(
        Item={
            'restaurant': business_id,
            'reviews': reviews,
            'last_updated_time': int(time.time()),
        }
    )
    return reviews

def getChatGPTPredictionForBestDish(business_id, reviews):
    # Check if the result is already cached
    cache_gpt_response = gpt_response_dynamodb_table.get_item(Key={'restaurant': business_id})
    if (cache_gpt_response.get('Item') != None):
        # TODO: add time check and if cache is too old, skip
        return cache_gpt_response.get('Item').get('response')

    context = 'You are a restaurant review aggregator and your job is to read reviews of a particular restaurant. Given a list of reviews, return the best dish and the most popular dish at the restaurant in the following format: "The best reviewed dish is the ___ while the most popular dish is the ___".'
    prompt = 'What is the best dish and most popular dish given the following reviews:' + str(reviews)
    completion = open_ai_client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": context},
            {"role": "user", "content": prompt}
        ],
        temperature=0.2
    )
    answer = completion.choices[0].message.content
    # Cache results
    gpt_response_dynamodb_table.put_item(
        Item={
            'restaurant': business_id,
            'response': answer,
            'last_updated_time': int(time.time()),
        }
    )

    return answer

def food_recommender_api(restaurant_id):
    try:
        # Check if the result is already cached
        cache_gpt_response = gpt_response_dynamodb_table.get_item(Key={'restaurant': restaurant_id})
        if (cache_gpt_response.get('Item') != None):
            # TODO: add time check and if cache is too old, skip
            return json.dumps(cache_gpt_response.get('Item').get('response'))

        # If not, scrape the reviews and cache them
        reviews = scrape_yelp_reviews(restaurant_id, 3)
        response = getChatGPTPredictionForBestDish(restaurant_id, reviews)
        return json.dumps(response)
    except Exception as e:
        return {
            "statusCode": 400,
            "body": json.dumps('Error: ' + str(e))
        }

def yelp_api(restaurant_name, location):
    # Check if the result is already cached
    restaurant_and_location_key = str(restaurant_name) + '_' + str(location)
    cache_yelp_response = yelp_api_business_search_response_dynamodb_table.get_item(Key={'restaurant_and_location': restaurant_and_location_key})
    if (cache_yelp_response.get('Item') != None):
        # TODO: add time check and if cache is too old, skip
        # TODO some kind of bug where we aren't returning json correctly bc we cast response to a string
        return cache_yelp_response.get('Item').get('response')

    url = 'https://api.yelp.com/v3/businesses/search?location=' + str(location) + '&term=' + str(restaurant_name) + '&sort_by=best_match&limit=5'
    headers = {'Authorization': f"Bearer {YELP_API_KEY}"}
    response = requests.get(url, headers=headers)
    # TODO: Can we filter results by only restaurants?
    # Cache results
    yelp_api_business_search_response_dynamodb_table.put_item(
        Item={
            'restaurant_and_location': restaurant_and_location_key,
            'response': json.dumps(response.json()),
            'last_updated_time': int(time.time()),
        }
    )
    return json.dumps(response.json())

def lambda_handler(event, context):
    # Validate the request
    valid_request = True
    if (event.get("requestContext").get("http").get("method") != 'GET'):
        valid_request = False
    elif (event.get("requestContext").get("http").get("path") != '/food-recommender-api' and event.get("requestContext").get("http").get("path") != '/yelp-api'):
        valid_request = False

    if (valid_request == False):
        return {
            "statusCode": 400,
            "body": json.dumps("Request is not valid.")
        }

    # This is a valid request and we need to execute the business logic
    # Check which API the user is calling
    if (event.get("requestContext").get("http").get("path") == '/food-recommender-api'):
        if (len(event.get("queryStringParameters", {}).get("restaurant_id", "")) == 0):
            return {
                "statusCode": 400,
                "body": json.dumps("Request is not valid.")
            }
        return food_recommender_api(event.get("queryStringParameters", {}).get("restaurant_id"))
    elif (event.get("requestContext").get("http").get("path") == '/yelp-api'):
        if (len(event.get("queryStringParameters", {}).get("location", "")) == 0):
            return {
                "statusCode": 400,
                "body": json.dumps("Request is not valid.")
            }
        else:
            return yelp_api(event.get("queryStringParameters", {}).get("restaurant"), event.get("queryStringParameters", {}).get("location"))
    else:
        return {
            "statusCode": 400,
            "body": json.dumps("Request is not valid.")
        }
