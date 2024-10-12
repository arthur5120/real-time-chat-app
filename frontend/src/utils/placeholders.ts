export const userPlaceholder = {
    name : '',
    username : '',
    email : '',
    password : '',
    role : 'User',
}

export const messagePlaceholder = { 
    id : '',   
    user : '', 
    content : '', 
    created_at : 0,
    updated_at : 0,
    room : '',
    wasEdited : false,    
  }

export const roomsPlaceholder = [
    {
        id : '-1', 
        name : ''
    }
]

export const currentRoomPlaceHolder = {
    id : '-1', 
    selectId : 0, 
    name : ''
}

export const errorMessagePlaceholder = `Something Went Wrong, please try again later`

export const errorObjectPlaceholder = {
    expired : true,
    isDuplicate : false,
    message : errorMessagePlaceholder,
    timestamp : 0,
}