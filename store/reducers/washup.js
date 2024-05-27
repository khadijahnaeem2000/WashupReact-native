import { 
    DASHBOARD 
} from '../actions/washup'

import { Image } from 'react-native'

import profilePicture from '../../assets/images/profilepic.png';

const profilePictureURI = Image.resolveAssetSource(profilePicture).uri

const initialState = {
    profilePic:profilePictureURI
  }


  export default (state = initialState, action) => {
    switch (action.type) {
    case DASHBOARD:
        console.log("WASHUP REDUCER : DASHBOARD")
        console.log(state)
        state = {
            ...state
        }
        return state;  

    }
    return state;

    }