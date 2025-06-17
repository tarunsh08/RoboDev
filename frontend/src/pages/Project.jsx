import React, {useState} from 'react'
import { useLocation } from 'react-router-dom'

const Project = () => {
    const location = useLocation();

    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
    
  return (
    <main className='h-screen w-screen flex'>
      <section className="left relative h-full min-w-96 bg-fuchsia-300 flex flex-col">
        <header className='flex justify-between items-center p-2 px-4 w-full bg-fuchsia-200'>
          <button className='flex gap-2'>
            <i className='ri-add-fill mr-1'></i>
            <p>Add Collaborators</p>
          </button>
          <button className='p-2 cursor-pointer' onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}>
          <i className='ri-group-fill'></i>
          </button>
        </header>

        <div className="conversation-area flex-grow flex flex-col">
          <div className="message-box flex-grow flex flex-col gap-1">
            <div className="max-w-56 message flex flex-col p-2 m-0.5 bg-fuchsia-50 w-fit rounded-xl">
              <small className='opacity-65 text-xs'>example@gmail.com</small>
              <p className='text-sm'>hello papa </p>
              </div>
            <div className="max-w-56 message flex flex-col ml-auto p-2 m-0.5 bg-fuchsia-50 w-fit rounded-xl">
              <small className='opacity-65 text-xs'>example@gmail.com</small>
              <p className='text-sm'>namaste beta </p>
              </div>
          </div>
          <div className="inputField w-full flex">
            <input type="text" placeholder='Enter message' className='p-2 px-4 border-none outline-none flex-grow bg-fuchsia-100' />
            <button className='bg-fuchsia-200 px-5'><i class="ri-send-plane-2-fill"></i></button>
          </div>
        </div>

      <div className={`w-full h-full flex flex-col gap-2 absolute transition-all ${ isSidePanelOpen? 'translate-x-0':'-translate-x-full'} top-0 bg-fuchsia-300`}>
          <header className='p-2 px-3 flex justify-end bg-fuchsia-200'>
            <button onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} className='p-2 cursor-pointer'>
              <i className='ri-close-fill'></i>
            </button>
          </header>

          <div className='users flex flex-col gap-2'>
            <div className='user flex gap-2 items-center cursor-pointer hover:bg-fuchsia-200 p-2'>
              <div className="aspect-square w-fit h-fit flex items-center justify-center rounded-full p-5 bg-slate-600"><i className="ri-user-6-fill absolute"></i></div>
            <h1 className='font-semibold text-lg'>Username</h1>
            </div>
          </div>

      </div>
      </section>
    </main>
  )
}

export default Project
