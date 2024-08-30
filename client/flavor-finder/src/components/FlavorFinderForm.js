import React, {useState, useEffect, useRef} from 'react';
import TextField from "@mui/material/TextField";
import {Autocomplete, createFilterOptions} from "@material-ui/lab";
import {FormGroup, Paper} from '@material-ui/core';
import CityData from '../data/cities.json';
import {Button} from './Button';
import { FiArrowRight } from 'react-icons/fi';
import {ReactTyped} from "react-typed";
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';

const FlavorFinderForm = () => {
    // State for API responses from server for the GPT endpoint
    const [serverGPTResponse, setServerGPTResponse] = useState('');
    const [serverGPTError, setServerGPTError] = useState('');

    // State for whether the user has sent a request to the server and whether
    // we have waited on the client to display the result
    const [sentFirstRequest, setSentFirstRequest] = useState(false);
    const [waited, setWaited] = useState(false);

    // "Helper" state to decide how to show the responses
    const [showMainResponseBox, setShowMainResponseBox] = useState(false);
    const [showLoading, setShowLoading] = useState(false);
    const [showGptResponse, setShowGptResponse] = useState(false);
    const [showGptError, setShowGptError] = useState(false);
    // Hook to update the "helper" state
    useEffect(() => {
        if (sentFirstRequest) {
            setShowMainResponseBox(true);
        }
        if (waited) {
            if (serverGPTResponse !== '' && serverGPTError === '') {
                setShowLoading(false);
                setShowGptResponse(true);
            } else if (serverGPTResponse === '' && serverGPTError !== '') {
                setShowLoading(false);
                setShowGptError(true);
            }
        } else {
            setShowLoading(true);
            setShowGptResponse(false);
            setShowGptError(false);
        }
    }, [serverGPTResponse, serverGPTError, waited, sentFirstRequest]);


    // Set cities list to the cities in the JSON file
    let autocompleteCitiesToDisplay = CityData;
    // autocompleteBusinessesToDisplay will be set once we make an API call to our server's Yelp API
    const [autocompleteBusinessesToDisplay, setAutocompleteBusinessesToDisplay] = useState([]);

    // State for the user selected city
    const  [selectedCity, setSelectedCity] = React.useState('');
    const handleSetSelectedCity = (event, newValue, reason) => {
        if (newValue !== null) {
            setSelectedCity(newValue.city + ', ' + newValue.state);
        } else {
            setSelectedCity('');
        }
	};

    // State for the user selected restaurant (ID will be the Yelp ID of the business)
    const [selectedRestaurantID, setSelectedRestaurantID] = React.useState('');
    const handleSetSelectedRestaurantID = (event, newValue, reason) => {
        if (newValue !== null) {
            setSelectedRestaurantID(newValue.alias);
        } else {
            setSelectedRestaurantID('');
        }
	};

    // Abort controller to cancel the previous network request if a new network request is issued
    // for the server's Yelp API
    const abortControllerYelpRef = useRef(null);

    // Call the Server's Yelp API to get a list of businesses that match the keyword in the city
    async function callServerYelpAPI(restaurantKeyword, city) {
        // Don't make a network request if the user hasn't entered a keyword and city
        if (restaurantKeyword === '' || city === '') {
            return;
        }
        // Abort any pending network requests
        if (abortControllerYelpRef.current) {
            abortControllerYelpRef.current.abort();
        }
        // Create new abort controller
        const newYelpAbortController = new AbortController();
        abortControllerYelpRef.current = newYelpAbortController;

        fetch(`https://3dv7atqwqoaffiyadtwb46su6y0cpjzw.lambda-url.us-east-2.on.aws/yelp-api?restaurant=${encodeURIComponent(restaurantKeyword)}&location=${encodeURIComponent(city)}`,
        {
            method: "GET",
            signal: newYelpAbortController.signal,
        }).then((response) => response.json()).then((data) => {
            if (data?.businesses != null) {
                setAutocompleteBusinessesToDisplay(data?.businesses);
            }
        }).catch((error) => console.log(error));
    }
    const onRestaurantKeywordChange = (event, value, reason) => {
        callServerYelpAPI(value, selectedCity);
    };

    // Create filter to only display 5 cities at a time
    const defaultFilterOptions = createFilterOptions();
    const OPTIONS_LIMIT = 5;
    const filterAndDisplayFixedNumberOfOptions = (options, state) => {
        return defaultFilterOptions(options, state).slice(0, OPTIONS_LIMIT);
      };

    // Abort controller to cancel previous network request if a new network request is issued
    // for the server's GPT API
    const abortControllerGPTRef = useRef(null);

    // Call the Server's GPT API to read the reviews for the given restaurant ID and make a suggestion
    const callServerGPTAPI = () => {
        // Don't make a network request if the user hasn't entered a restaurant ID
        if (selectedRestaurantID === '') {
            return;
        }

        // Reset the previous state
        setServerGPTError('');
        setServerGPTResponse('');
        setWaited(false);
        setSentFirstRequest(true);
        setTimeout(() => {
            // After 5 seconds, set the waited state to true to show the GPT response after a delay
            setWaited(true);
        }, 5000);

        // Abort any pending network requests
        if (abortControllerGPTRef.current) {
            abortControllerGPTRef.current.abort();
        }
        // Create new abort controller
        const newGPTAbortController = new AbortController();
        abortControllerGPTRef.current = newGPTAbortController;
            fetch(`https://3dv7atqwqoaffiyadtwb46su6y0cpjzw.lambda-url.us-east-2.on.aws/food-recommender-api?restaurant_id=${selectedRestaurantID}`,
        {
            method: "GET",
            signal: newGPTAbortController.signal,
        }).then((response) => response.json()).then((data) => {
            setServerGPTResponse(data);
        }).catch((error) => {
            setServerGPTError(error);
        });
    }

    return (
    <>
        <FormGroup className='search-form'>
            <div className="row">
                <div className="search-form-element">
                    <Autocomplete
                            disablePortal
                            id="city-selector"
                            options={autocompleteCitiesToDisplay}
                            onChange={handleSetSelectedCity}
                            noOptionsText=""
                            getOptionSelected={(option, value) => (option?.city + ', ' + option?.state) === (value?.city + ', ' + value?.state)}
                            filterOptions={filterAndDisplayFixedNumberOfOptions}
                            getOptionLabel={option => option.city + ', ' + option.state}
                            sx={{ width: 1000 }}
                            renderInput={(params) => <TextField {...params} label="City Name" />}
                        />
                </div>
                <div className="search-form-element">
                    <Autocomplete
                            disablePortal
                            disabled={selectedCity === ''}
                            id="restaurant-selector"
                            options={autocompleteBusinessesToDisplay}
                            onInputChange={onRestaurantKeywordChange}
                            onChange={handleSetSelectedRestaurantID}
                            noOptionsText="..."
                            getOptionSelected={(option, value) => option?.alias === value?.alias}
                            filterOptions={(options) => options} // aka don't leverage MUI filtering since we will use our API to return results directly
                            getOptionLabel={option => option?.name}
                            renderInput={(params) => <TextField {...params} label="Restaurant Name" />}
                        />
                 </div>
            </div>
        </FormGroup>

        <br></br>
        <button className="secondary-button" onClick={callServerGPTAPI} disabled={selectedCity === '' || selectedRestaurantID === ''}>
            Search <FiArrowRight />
        </button>

        <br></br>
        {showMainResponseBox &&
            <Paper elevation={10} className='gpt-response'>
                {(showLoading) &&
                <>
                    <Box sx={{ width: '100%' }}>
                        <div className='gpt-response-text'>
                            Analyzing reviews... results may take up to 30 seconds!
                        </div>
                        <br></br>
                        <LinearProgress sx={{
                            backgroundColor: 'white',
                            '& .MuiLinearProgress-bar': {
                                backgroundColor: 'orange'
                            }
                            }}/>
                    </Box>
                </>
                }
                {(showGptResponse) &&
                    <div className='gpt-response-text'>
                        <ReactTyped strings={[serverGPTResponse]} typeSpeed={50} />
                    </div>
                }
                {(showGptError) &&
                    <div className='gpt-response-error'>
                        {'Error: ' + serverGPTError}
                    </div>
                }
            </Paper>
        }
    </>
    );
    // TODO Make seach button take up whole page when mobile
}

export default FlavorFinderForm;
