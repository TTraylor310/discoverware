import { Form } from 'react-bootstrap';
import { LoadScript, Autocomplete } from '@react-google-maps/api';
import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';

function Places(props) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [image, setImage] = useState('');
  const [types, setTypes] = useState([]);
  const [lat, setLat] = useState(47.6180106);
  const [lng, setLng] = useState(-122.3516264);
  const [autoComplete, setAutoComplete] = useState(null);

  const { getIdTokenClaims, isAuthenticated } = useAuth0();

  const onLoad = (autocomplete) => {
    setAutoComplete(autocomplete);
  }

  const onPlaceChanged = () => {
    if (autoComplete !== null) {
      const place = autoComplete.getPlace();
      const newLat = place.geometry.location.lat();
      const newLng = place.geometry.location.lng();
      let imageUrl;
      try {
        imageUrl = place.photos[0].getUrl();
      } catch (error) {
        imageUrl = '../assets/defaultPlaceImage.png'
      }
      setName(place.place_id);
      setAddress(place.formatted_addres);
      setImage(imageUrl);
      setTypes([...place.types]);
      setLat(newLat);
      setLng(newLng);
      props?.mapRef.panTo({lat: newLat, lng: newLng});
    } else {
      console.log('Autocomplete is not loaded yet!');
    }
  }

  const savePlace = async () => {
    try {
      if (autoComplete === null) {
        console.log("state is not defined yet");
        return;
      } else {
        const res = await getIdTokenClaims();
        const token = res.__raw;
        const config = {
          headers: { Authorization: `Bearer ${token}` },
          method: 'post',
          baseURL: process.env.REACT_APP_SERVER,
          url: '/place',
          data: {name, address, image, types, lat, lng}
        };
        const postResponse = await axios(config);
        console.log('postResponse.data: ', postResponse.data);
      }
    } catch (error) {
      console.error('Error in savePlace', error);
    }
  }

  return (
    <LoadScript
    googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
    libraries={props.libraries}
  >
    <Autocomplete
      onLoad={onLoad}
      onPlaceChanged={onPlaceChanged}
    >
      <Form.Control type='search' placeholder='Search' className='search'></Form.Control>
    </Autocomplete>
    {
      isAuthenticated && <Button variant='secondary' onClick={savePlace}>Save Place</Button>
    }
  </LoadScript>
  );
}

export default Places;
