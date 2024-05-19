
const Error = () => {

  console.log('Rendering Error')
    
  return (    
    
      <div className='flex flex-col justify-center items-center text-center gap-5 m-5'>
      
        <picture>
          <img 
              src='src/assets/icons/triangle-exclamation-solid.svg' 
              alt='Error Icon' 
              width='64' 
              height='64'
          />                    
        </picture>

        <h3 className='font-bold text-xl'>          
          Oops...<br/> 
          Something Went Wrong <br/>
          Sorry About That<br/>
        </h3>

      </div>
  
    )
}

export default Error

