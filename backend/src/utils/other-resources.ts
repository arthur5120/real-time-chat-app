export const roomAdjectives = [
    'Vigilant', 'Mysterious', 'Brave',
    'Whimsical', 'Fierce', 'Ethereal',
    'Tenacious','Luminous', 'Enigmatic', 'Dazzling',
]
  
export const roomColors = [
    'Crimson', 'Latte', 'Mint',
    'Indigo', 'Cobalt', 'Ambar',
    'Plum', 'Ivory', 'Rose', 'Obsidian',
]

export const roomCreatures  = [
    'Phoenix', 'Gryphon', 'Sphinx',
    'Chimera', 'Harpy', 'Gorgon',
    'Hippogriff', 'Kappa', 'Manticore', 'Cerberus',
]

export const roomNames = [
    'Space','Place', 'Area',
    'Chamber', 'Cabin', 'Cell',
    'Alcove','Closet',
]

export const getError = (desc ? : string) => {    
    const newError = new Error(desc || `Unknown Error`)
    newError.name = `CustomError`
    return newError
}

export const getErrorMessage = (e ? : unknown) => {  
    
    const defaultError = {
        success : false,
        message : `Internal Error`,    
        timestamp: new Date().toISOString(),
        statusCode: 500,
    }
    
    if (e instanceof Error) {
        return { 
            ...defaultError, 
            message: e.message || `Internal Error`,
            timestamp: new Date().toISOString(),            
        }
    }
    return defaultError
}