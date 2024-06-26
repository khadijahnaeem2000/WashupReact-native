import { 
    SIGN_IN, 
    SIGN_OUT, 
    ALREADY_SIGNED_IN,
    NOT_SIGNED_IN,
    SIGN_IN_ERROR,
    REFRESHING
} from '../actions/auth'

const initialState = {
    isSignedIn:false,
    isTokenChecked:false,
    signInError:"",
    refreshing:false  };
  
  export default (state = initialState, action) => {
    switch (action.type) {

    case REFRESHING:
        state = {
            ...state,
            refreshing:action.payload
        }
        return state;  

    case SIGN_IN:
        state = {
            ...state,
            isSignedIn:action.payload,
            isTokenSet:action.payload,
            signInError:"",
            refreshing:false
        }
        return state;  

    case SIGN_IN_ERROR:
        state = {
            ...state,
            signInError:action.payload,
            refreshing:false
        }
        return state;  
    
    case SIGN_OUT:
        state = {
            ...state,
            isSignedIn:false,
            signInError:"",
            refreshing:false
        }
        return state

    case ALREADY_SIGNED_IN:
            state = {
                ...state,
                isSignedIn:true,
                signInError:"",
                refreshing:false
            }
        return state;  

    case NOT_SIGNED_IN:
            state = {
                ...state,
                isSignedIn:false,
                isTokenChecked:true,
                signInError:"",
                refreshing:false
            }
        return state;  
    }
    return state;
    }