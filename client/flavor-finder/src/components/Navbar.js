import React, { useState } from "react";
import Logo from "../assets/logo.svg";
import { HiOutlineBars3 } from "react-icons/hi2";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InfoIcon from "@mui/icons-material/Info";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import '../App.css';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const Navbar = () => {

  const [clickedAbout, setClickedAbout] = React.useState(false);
  const [clickedContactUs, setClickedContactUs] = React.useState(false);

  const onCloseModal = () => {
    setClickedContactUs(false);
    setClickedAbout(false);
    handleCloseModal();
  }

  const onClickContactUs = () => {
    setClickedContactUs(true);
    handleOpenModal();
  }

  const onClickAbout = () => {
    setClickedAbout(true);
    handleOpenModal();
  }

  const [openModal, setOpenModal] = React.useState(false);
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  // const [openMenu, setOpenMenu] = useState(false);
  // const menuOptions = [
  //   {
  //     text: "How It Works",
  //     icon: <InfoIcon />,
  //   },
  //   {
  //     text: "Contact Us",
  //     icon: <PhoneRoundedIcon />,
  //   },
  // ];
  return (
    <nav>
      <div className="nav-logo-container">
        <img src={Logo} alt="" />
      </div>
      <div className="navbar-links-container">
        <a onClick={onClickAbout}>How It Works</a>
        <button className="primary-button" onClick={onClickContactUs}>Contact Us</button>
      </div>
      <Modal
        open={openModal}
        onClose={onCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          {clickedAbout &&
            <>
              <h1>How It Works</h1>
              <br></br>
              <p> We use third party data collection software to aggregate reviews of restaurants across the United States. We then
                analyze thousands of reviews and use GPT-4 to figure out the best dish at any particular restaurant.
              </p>
              <br></br>
              <h1>Why make this?</h1>
              <br></br>
                <p>When going to a restaurant for the first time, it's hard to decide to what to order. I've been to many places
                  I thought were "mid" but it just turned out I ordered the wrong thing. I made this tool so that no one ever has to
                  face this again! Please feel free to leave any suggestions or feedback to flavorfinderai@gmail.com.
                </p>
            </>

          }
          {clickedContactUs &&
            <>
              <h1>Contact Us</h1>
              <br></br>
              <p> Feel free to email flavorfinderai@gmail.com with any comments, feedback, or suggestions. I'll be reading each and every email! </p>
            </>

          }

          {/* hello */}
          {/* <Typography id="modal-modal-title" variant="h6" component="h2">
            Text in a modal
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
          </Typography> */}
        </Box>
      </Modal>
      {/* <div className="navbar-menu-container">
        <HiOutlineBars3 onClick={() => setOpenMenu(true)} />
      </div> */}
      {/* <Drawer open={openMenu} onClose={() => setOpenMenu(false)} anchor="right">
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={() => setOpenMenu(false)}
          onKeyDown={() => setOpenMenu(false)}
        >
          <List>
            {menuOptions.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
        </Box>
      </Drawer> */}
    </nav>
  );
};

export default Navbar;
