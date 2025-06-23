import React, { useState, useEffect, useContext, useRef } from 'react'
import { UserContext } from '../context/user.context'
import { useLocation } from 'react-router-dom'
import axios from '../config/axios'
import { initializeSocket, receiveMessage, sendMessage } from '../config/socket'
import Markdown from 'markdown-to-jsx'
import hljs from 'highlight.js';
import { getWebContainer } from '../config/webContainer'


function SyntaxHighlightedCode(props) {
  const ref = useRef(null)

  React.useEffect(() => {
    if (ref.current && props.className?.includes('lang-') && window.hljs) {
      window.hljs.highlightElement(ref.current)

      // hljs won't reprocess the element unless this attribute is removed
      ref.current.removeAttribute('data-highlighted')
    }
  }, [props.className, props.children])

  return <code {...props} ref={ref} />
}


const Project = () => {

  const location = useLocation()

  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState(new Set()) 
  const [project, setProject] = useState(location.state.project)
  const [message, setMessage] = useState('')
  const { user } = useContext(UserContext)
  const messageBox = React.createRef()

  const [users, setUsers] = useState([])
  const [messages, setMessages] = useState([]) // New state variable for messages
  const [fileTree, setFileTree] = useState({})

  const [currentFile, setCurrentFile] = useState(null)
  const [openFiles, setOpenFiles] = useState([])

  const [webContainer, setWebContainer] = useState(null)
  const [iframeUrl, setIframeUrl] = useState(null)

  const [runProcess, setRunProcess] = useState(null)

  const handleUserClick = (id) => {
    setSelectedUserId(prevSelectedUserId => {
      const newSelectedUserId = new Set(prevSelectedUserId);
      if (newSelectedUserId.has(id)) {
        newSelectedUserId.delete(id);
      } else {
        newSelectedUserId.add(id);
      }

      return newSelectedUserId;
    });


  }

  function addCollaborators() {

    axios.put("/projects/add-user", {
      projectId: location.state.project._id,
      users: Array.from(selectedUserId)
    }).then(res => {
      console.log(res.data)
      setIsModalOpen(false)

    }).catch(err => {
      console.log(err)
    })
  }

  const send = () => {

    sendMessage('project-message', {
      message,
      sender: user
    })
    // appendOutgoingMessage(message)
    setMessages(prevMessages => [...prevMessages, { sender: user, message }]) 
    setMessage("")

  }

  function WriteAiMessage(message) {

    const messageObject = JSON.parse(message)

    return (
      <div
        className='p-4 overflow-auto text-gray-100 border shadow-lg rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700'
      >
        <Markdown
          children={messageObject.text}
          options={{
            overrides: {
              code: SyntaxHighlightedCode,
            },
          }}
        />
      </div>)
  }

  useEffect(() => {

    initializeSocket(project._id)

    if (!webContainer) {
      getWebContainer().then(container => {
        setWebContainer(container)
        console.log("container started")
      })
    }


    receiveMessage('project-message', data => {

      console.log(data)
      // appendIncomingMessage(data)

      if (data.sender._id == 'ai') {
        const message = JSON.parse(data.message)
        console.log(message)
        webContainer?.mount(message.fileTree)
        
        if (message.fileTree) {
          setFileTree(message.fileTree || {})
        }
        
        setMessages(prevMessages => [...prevMessages, data]) 
      } else {
        setMessages(prevMessages => [...prevMessages, data]) 
      }
    })


    axios.get(`/projects/get-project/${location.state.project._id}`).then(res => {

      console.log(res.data.project)

      setProject(res.data.project)
      setFileTree(res.data.project.fileTree || {})
    })

    axios.get('/users/all').then(res => {

      setUsers(res.data.users)

    }).catch(err => {

      console.log(err)

    })

  }, [])

  function saveFileTree(ft) {
    axios.put('/projects/update-file-tree', {
      projectId: project._id,
      fileTree: ft
    }).then(res => {
      console.log(res.data)
    }).catch(err => {
      console.log(err)
    })
  }

  function scrollToBottom() {
    messageBox.current.scrollTop = messageBox.current.scrollHeight
  }

  return (
    <main className='flex w-screen h-screen text-gray-100 bg-slate-900'>
      <section className="relative flex flex-col h-screen border-r left min-w-96 bg-gradient-to-b from-slate-800 to-slate-900 border-slate-700">
        <header className='absolute top-0 z-10 flex items-center justify-between w-full p-4 px-6 border-b shadow-lg bg-slate-800/95 backdrop-blur-sm border-slate-700'>
          <button 
            className='flex items-center gap-3 px-4 py-2 text-sm font-medium text-white transition-all duration-200 transform rounded-lg shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl hover:scale-105' 
            onClick={() => setIsModalOpen(true)}
          >
            <i className="text-lg ri-add-fill"></i>
            <p>Add Collaborator</p>
          </button>
          <button 
            onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} 
            className='p-3 text-gray-300 transition-all duration-200 rounded-lg hover:text-white hover:bg-slate-700'
          >
            <i className="text-xl ri-group-fill"></i>
          </button>
        </header>
        
        <div className="relative flex flex-col flex-grow h-full pt-20 pb-4 conversation-area">
          <div
            ref={messageBox}
            className="flex flex-col flex-grow max-h-full gap-3 p-4 overflow-auto message-box scrollbar-hide">
            {messages.map((msg, index) => (
              <div key={index} className={`${msg.sender._id === 'ai' ? 'max-w-80' : 'max-w-72'} ${msg.sender._id == user._id.toString() && 'ml-auto'}  message flex flex-col p-4 bg-slate-800/80 backdrop-blur-sm w-fit rounded-xl shadow-lg border border-slate-700 hover:bg-slate-800 transition-all duration-200`}>
                <small className='mb-2 text-xs font-medium text-gray-400'>{msg.sender.email}</small>
                <div className='text-sm leading-relaxed'>
                  {msg.sender._id === 'ai' ?
                    WriteAiMessage(msg.message)
                    : <p className="text-gray-200">{msg.message}</p>}
                </div>
              </div>
            ))}
          </div>

          <div className="absolute bottom-0 flex w-full p-4 inputField">
            <div className="flex w-full overflow-hidden border shadow-lg bg-slate-800 rounded-xl border-slate-600">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className='flex-grow p-4 px-6 text-gray-200 placeholder-gray-400 bg-transparent border-none outline-none' 
                type="text" 
                placeholder='Type your message...' 
              />
              <button
                onClick={send}
                className='px-6 text-white transition-all duration-200 transform bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105'>
                <i className="text-lg ri-send-plane-fill"></i>
              </button>
            </div>
          </div>
        </div>
        
        <div className={`sidePanel w-full h-full flex flex-col bg-slate-800/95 backdrop-blur-sm absolute transition-all duration-300 ease-in-out ${isSidePanelOpen ? 'translate-x-0' : '-translate-x-full'} top-0 border-r border-slate-700 shadow-2xl`}>
          <header className='flex items-center justify-between p-6 border-b bg-slate-900/90 border-slate-700'>
            <h1 className='text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400'>
              Collaborators
            </h1>
            <button 
              onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} 
              className='p-3 text-gray-300 transition-all duration-200 rounded-lg hover:text-white hover:bg-slate-700'
            >
              <i className="text-xl ri-close-fill"></i>
            </button>
          </header>
          
          <div className="flex flex-col gap-3 p-4 users">
            {project.users && project.users.map((user, index) => {
              return (
                <div key={index} className="flex items-center gap-4 p-4 transition-all duration-200 border border-transparent cursor-pointer user hover:bg-slate-700/50 rounded-xl hover:border-slate-600">
                  <div className='flex items-center justify-center w-12 h-12 text-white rounded-full shadow-lg bg-gradient-to-br from-blue-500 to-purple-600'>
                    <i className="text-lg ri-user-fill"></i>
                  </div>
                  <h1 className='text-lg font-semibold text-gray-200'>{user.email}</h1>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="flex flex-grow h-full right bg-slate-900">
        <div className="h-full border-r explorer max-w-64 min-w-52 bg-slate-800 border-slate-700">
          <div className="w-full p-2 file-tree">
            <h3 className="px-3 py-2 mb-3 text-sm font-semibold text-gray-400">FILES</h3>
            {
              Object.keys(fileTree).map((file, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentFile(file)
                    setOpenFiles([...new Set([...openFiles, file])])
                  }}
                  className="flex items-center w-full gap-3 p-3 px-4 mb-1 text-gray-300 transition-all duration-200 border border-transparent rounded-lg cursor-pointer tree-element bg-slate-800 hover:bg-slate-700 hover:text-white hover:border-slate-600">
                  <i className="text-blue-400 ri-file-code-fill"></i>
                  <p className='text-sm font-medium'>{file}</p>
                </button>))
            }
          </div>
        </div>
        
        <div className="flex flex-col flex-grow h-full code-editor shrink bg-slate-900">
          <div className="flex justify-between w-full p-3 border-b bg-slate-800 border-slate-700 top">
            <div className="flex gap-1 files">
              {
                openFiles.map((file, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentFile(file)}
                    className={`open-file cursor-pointer p-3 px-4 flex items-center w-fit gap-2 rounded-lg transition-all duration-200 ${currentFile === file ? 'bg-slate-700 text-white border border-slate-600' : 'bg-slate-800 text-gray-400 hover:text-white hover:bg-slate-700'}`}>
                    <i className="text-sm ri-file-code-fill"></i>
                    <p className='text-sm font-medium'>{file}</p>
                  </button>
                ))
              }
            </div>

            <div className="flex gap-2 actions">
              <button
                onClick={async () => {
                  await webContainer?.mount(fileTree)

                  const installProcess = await webContainer?.spawn("npm", ["install"])

                  installProcess?.output.pipeTo(new WritableStream({
                    write(chunk) {
                      console.log(chunk)
                    }
                  }))

                  if (runProcess) {
                    runProcess.kill()
                  }

                  let tempRunProcess = await webContainer?.spawn("npm", ["start"]);

                  tempRunProcess?.output.pipeTo(new WritableStream({
                    write(chunk) {
                      console.log(chunk)
                    }
                  }))

                  setRunProcess(tempRunProcess)

                  webContainer.on('server-ready', (port, url) => {
                    console.log(port, url)
                    setIframeUrl(url)
                  })

                }}
                className='flex items-center gap-2 p-3 px-5 font-medium text-white transition-all duration-200 transform rounded-lg shadow-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:shadow-xl hover:scale-105'
              >
                <i className="ri-play-fill"></i>
                Run
              </button>
            </div>
          </div>
          
          <div className="flex flex-grow max-w-full overflow-auto bottom shrink">
            {
              fileTree[currentFile] && (
                <div className="flex-grow h-full overflow-auto code-editor-area bg-slate-900">
                  <pre className="h-full hljs bg-slate-900">
                    <code
                      className="h-full text-gray-200 outline-none hljs bg-slate-900"
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        const updatedContent = e.target.innerText;
                        const ft = {
                          ...fileTree,
                          [currentFile]: {
                            file: {
                              contents: updatedContent
                            }
                          }
                        }
                        setFileTree(ft)
                        saveFileTree(ft)
                      }}
                      dangerouslySetInnerHTML={{ __html: hljs.highlight('javascript', fileTree[currentFile].file.contents).value }}
                      style={{
                        whiteSpace: 'pre-wrap',
                        paddingBottom: '25rem',
                        counterSet: 'line-numbering',
                        padding: '2rem',
                        fontSize: '14px',
                        lineHeight: '1.6'
                      }}
                    />
                  </pre>
                </div>
              )
            }
          </div>
        </div>

        {iframeUrl && webContainer &&
          (<div className="flex flex-col h-full border-l min-w-96 border-slate-700">
            <div className="p-3 border-b address-bar bg-slate-800 border-slate-700">
              <input 
                type="text"
                onChange={(e) => setIframeUrl(e.target.value)}
                value={iframeUrl} 
                className="w-full p-3 px-4 text-gray-200 transition-all duration-200 border rounded-lg outline-none bg-slate-700 border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" 
                placeholder="Enter URL..."
              />
            </div>
            <iframe src={iframeUrl} className="w-full h-full bg-white"></iframe>
          </div>)
        }
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative max-w-full p-6 transition-all duration-300 transform border shadow-2xl bg-slate-800 rounded-2xl w-96 border-slate-700">
            <header className='flex items-center justify-between mb-6'>
              <h2 className='text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400'>
                Add Collaborators
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className='p-2 text-gray-400 transition-all duration-200 rounded-lg hover:text-white hover:bg-slate-700'
              >
                <i className="text-xl ri-close-fill"></i>
              </button>
            </header>
            
            <div className="flex flex-col gap-3 pr-2 mb-20 overflow-auto users-list max-h-96">
              {users.map(user => (
                <div 
                  key={user.id} 
                  className={`user cursor-pointer hover:bg-slate-700 ${Array.from(selectedUserId).indexOf(user._id) != -1 ? 'bg-slate-700 border-blue-500' : "border-transparent"} p-4 flex gap-4 items-center rounded-xl transition-all duration-200 border`} 
                  onClick={() => handleUserClick(user._id)}
                >
                  <div className='relative flex items-center justify-center w-12 h-12 text-white rounded-full shadow-lg bg-gradient-to-br from-blue-500 to-purple-600'>
                    <i className="text-lg ri-user-fill"></i>
                  </div>
                  <h1 className='text-lg font-semibold text-gray-200'>{user.email}</h1>
                  {Array.from(selectedUserId).indexOf(user._id) != -1 && (
                    <i className="ml-auto text-green-400 ri-check-fill"></i>
                  )}
                </div>
              ))}
            </div>
            
            <button
              onClick={addCollaborators}
              className='absolute px-6 py-3 font-semibold text-white transition-all duration-200 transform -translate-x-1/2 shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl bottom-6 left-1/2 hover:shadow-xl hover:scale-105'>
              Add Selected Collaborators
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

export default Project