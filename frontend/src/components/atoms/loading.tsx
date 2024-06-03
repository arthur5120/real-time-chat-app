const Error = () => {  
    
  return (    
    
      <div className='flex flex-col justify-center items-center text-center gap-5 m-5'>
      
        <picture>
          <img 
              src='src/assets/icons/spinner-solid.svg'
              alt='Loading Icon'
              width='64'
              height='64'
          />                    
        </picture>

        <h3 className='font-bold text-xl'>          
          Please wait a moment...
        </h3>

      </div>
  
    )
}

export default Error

