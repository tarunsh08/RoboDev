import React, { useState, useEffect, useContext, useRef } from 'react'
import { UserContext } from '../context/user.context'
import { useLocation } from 'react-router-dom'
import axios from '../config/axios'
import { initializeSocket, receiveMessage, sendMessage } from '../config/socket'
import Markdown from 'markdown-to-jsx'
import hljs from 'highlight.js'
import { getWebContainer } from '../config/webContainer'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Code2, Palette, MessageSquare, RefreshCw, Users, X } from "lucide-react"

function SyntaxHighlightedCode(props) {
  const ref = useRef(null)

  React.useEffect(() => {
    if (ref.current && props.className?.includes('lang-') && window.hljs) {
      window.hljs.highlightElement(ref.current)
      ref.current.removeAttribute('data-highlighted')
    }
  }, [props.className, props.children])

  return <code {...props} ref={ref} />
}

const Project = () => {
  const location = useLocation()
  const [activeTab, setActiveTab] = useState('code')
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState(new Set())
  const [project, setProject] = useState(location.state.project)
  const [message, setMessage] = useState('')
  const { user } = useContext(UserContext)
  const messageBox = useRef(null)

  const [users, setUsers] = useState([])
  const [messages, setMessages] = useState([])
  const [fileTree, setFileTree] = useState({})

  const [currentFile, setCurrentFile] = useState(null)
  const [openFiles, setOpenFiles] = useState([])

  const [webContainer, setWebContainer] = useState(null)
  const [iframeUrl, setIframeUrl] = useState(null)
  const [isServerRunning, setIsServerRunning] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [previewError, setPreviewError] = useState(null)
  const iframeRef = useRef(null)

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
      // Refresh project data to get updated collaborators
      axios.get(`/projects/get-project/${location.state.project._id}`).then(res => {
        setProject(res.data.project)
      })
    }).catch(err => {
      console.log(err)
    })
  }

  const send = () => {
    if (!message.trim()) return;

    sendMessage('project-message', {
      message,
      sender: user
    })
    setMessages(prevMessages => [...prevMessages, { sender: user, message }])
    setMessage("")
  }

  function WriteAiMessage(message) {
    const messageObject = JSON.parse(message)

    return (
      <div className='p-4 overflow-auto text-gray-100 border shadow-lg rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700'>
        <Markdown
          children={messageObject.text}
          options={{
            overrides: {
              code: SyntaxHighlightedCode,
            },
          }}
        />
      </div>
    )
  }

  const handleRefresh = () => {
    if (!iframeRef.current) return;
    setIsRefreshing(true);
    const src = iframeRef.current.src;
    iframeRef.current.src = '';
    setTimeout(() => {
      if (iframeRef.current) {
        iframeRef.current.src = src;
        setIsRefreshing(false);
      }
    }, 100);
  };

  const handleIframeError = () => {
    setPreviewError('Failed to load preview. Make sure the development server is running.');
  };

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

      // Scroll to bottom when new message arrives
      setTimeout(() => {
        if (messageBox.current) {
          messageBox.current.scrollTop = messageBox.current.scrollHeight;
        }
      }, 100);
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

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messageBox.current) {
      messageBox.current.scrollTop = messageBox.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="bg-[#121212] text-white h-screen flex overflow-hidden">
      {/* Collaborators Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-80 bg-neutral-900 z-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${isSidePanelOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <header className='flex items-center justify-between p-6 border-b border-neutral-800'>
            <h1 className='text-xl font-bold text-white'>
              Collaborators
            </h1>
            <button
              onClick={() => setIsSidePanelOpen(false)}
              className='p-2 text-gray-400 transition-all duration-200 rounded-lg hover:text-white hover:bg-neutral-800'
            >
              <X className="w-5 h-5" />
            </button>
          </header>

          <div className="flex-1 p-4 overflow-y-auto">
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gray-400 mb-3">Current Collaborators</h2>
              <div className="space-y-2">
                {project.users && project.users.map((user, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 transition-all duration-200 rounded-lg bg-neutral-800 hover:bg-neutral-700">
                    <div className='flex items-center justify-center w-8 h-8 text-white rounded-full bg-gradient-to-br from-blue-600 to-blue-800'>
                      <i className="text-sm ri-user-fill"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className='text-sm font-medium text-gray-200 truncate'>{user.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full py-3 px-4 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Users className="w-4 h-4" />
                Add New Collaborators
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center justify-between p-3 border-b border-neutral-800 bg-neutral-900">
          <h1 className="text-lg font-semibold text-white">{project.name}</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSidePanelOpen(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 transition-all duration-200 rounded-lg hover:text-white hover:bg-neutral-800"
            >
              <Users className="w-4 h-4" />
              <span>Collaborators</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          <ResizablePanelGroup direction="horizontal" className="flex-1">
            {/* Chat Panel - Fixed width */}
            <ResizablePanel defaultSize={25} minSize={20} maxSize={40} className="min-w-[300px]">
              <Card className="h-full flex flex-col border-0 rounded-none bg-neutral-900 border-r border-neutral-800">
                <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-900">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5 text-blue-400" />
                    <h2 className="text-lg font-semibold text-white">CHAT</h2>
                  </div>
                </div>

                <div className="flex-1 flex flex-col overflow-hidden">
                  <div
                    ref={messageBox}
                    className="flex-1 p-4 space-y-4 overflow-y-auto"
                  >
                    {messages.map((msg, i) => (
                      <div key={i} className={`rounded-lg p-3 max-w-full ${msg.sender._id === 'ai' ? 'bg-[#2222227d] border border-[#6d6d7a7d]' : msg.sender._id == user._id.toString() ? 'bg-[#171717] border border-[#6d6d7a77] ml-8' : 'bg-zinc-800/40 border border-zinc-700 text-xs italic'}`}>
                        <small className='mb-2 text-xs font-medium text-gray-400'>{msg.sender.email}</small>
                        <div className='text-sm leading-relaxed'>
                          {msg.sender._id === 'ai' ? WriteAiMessage(msg.message) : <p className="text-gray-200">{msg.message}</p>}
                        </div>
                      </div>
                    ))}

                    {messages.length === 0 && (
                      <div className="flex items-center justify-center h-32 text-gray-500">
                        <p>No messages yet. Start a conversation! <br /> Tag @ai for automating code</p>
                      </div>
                    )}
                  </div>

                  <div className="p-4 border-t border-neutral-800 bg-neutral-900">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && send()}
                        placeholder="Type your message..."
                        className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <Button
                        size="sm"
                        className="bg-blue-600 text-white hover:bg-blue-700"
                        onClick={send}
                        disabled={!message.trim()}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </ResizablePanel>

            <ResizableHandle className="w-1 bg-neutral-800 hover:bg-blue-500 transition-colors duration-200" />

            {/* Code & Preview Panel */}
            <ResizablePanel defaultSize={75} className="flex-1 min-w-0">
              <div className="h-full flex flex-col bg-neutral-900 border-l border-neutral-800">
                {/* Tab Headers */}
                <div className="flex border-b border-neutral-800 bg-neutral-900">
                  <button
                    onClick={() => setActiveTab('code')}
                    className={`flex items-center space-x-2 px-6 py-3 border-b-2 transition-colors ${activeTab === 'code'
                      ? 'border-blue-500 text-white'
                      : 'border-transparent text-neutral-400 hover:text-white hover:bg-neutral-800'
                      }`}
                  >
                    <Code2 className="h-4 w-4" />
                    <span className="font-medium">CODE</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('canvas')}
                    className={`flex items-center space-x-2 px-6 py-3 border-b-2 transition-colors ${activeTab === 'canvas'
                      ? 'border-blue-500 text-white'
                      : 'border-transparent text-neutral-400 hover:text-white hover:bg-neutral-800'
                      }`}
                  >
                    <Palette className="h-4 w-4" />
                    <span className="font-medium">PREVIEW</span>
                  </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden">
                  {/* Code Editor */}
                  {activeTab === 'code' && (
                    <div className="h-full flex">
                      {/* File Explorer */}
                      <div className="h-full w-64 bg-neutral-900 border-r border-neutral-800 overflow-y-auto">
                        <div className="p-3">
                          <h3 className="px-3 py-2 mb-2 text-sm font-semibold text-neutral-400">FILES</h3>
                          <div className="space-y-1">
                            {Object.keys(fileTree).map((file, index) => (
                              <button
                                key={index}
                                onClick={() => {
                                  setCurrentFile(file)
                                  setOpenFiles([...new Set([...openFiles, file])])
                                }}
                                className="flex items-center w-full gap-2 p-2 px-3 text-neutral-300 transition-all duration-200 rounded cursor-pointer hover:bg-neutral-800 hover:text-white"
                              >
                                <i className="text-blue-400 ri-file-code-fill text-sm"></i>
                                <span className='text-sm font-medium truncate'>{file}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Code Editor Area */}
                      <div className="flex-1 flex flex-col min-w-0">
                        {/* File Tabs */}
                        {openFiles.length > 0 && (
                          <div className="flex items-center border-b border-neutral-800 bg-neutral-800 overflow-x-auto">
                            {openFiles.map((file, index) => (
                              <button
                                key={index}
                                onClick={() => setCurrentFile(file)}
                                className={`flex items-center gap-2 px-4 py-2 text-sm border-r border-neutral-700 transition-colors duration-200 ${currentFile === file ? 'bg-neutral-900 text-white' : 'bg-neutral-800 text-neutral-400 hover:text-white'}`}
                              >
                                <i className="text-sm ri-file-code-fill"></i>
                                <span className="truncate max-w-xs">{file}</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenFiles(openFiles.filter(f => f !== file));
                                    if (currentFile === file) {
                                      setCurrentFile(openFiles.length > 1 ? openFiles[0] : null);
                                    }
                                  }}
                                  className="ml-2 text-neutral-500 hover:text-white"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Editor Content */}
                        <div className="flex-1 overflow-auto bg-neutral-900 scrollbar-hide">
                          {fileTree[currentFile] ? (
                            <div className="h-full">
                              <div className="flex items-center justify-between p-2 bg-neutral-800 border-b border-neutral-700">
                                <div className="text-sm text-neutral-400 truncate">
                                  {currentFile}
                                </div>
                                <Button
                                  onClick={async () => {
                                    if (!webContainer) return;

                                    try {
                                      await webContainer.mount(fileTree);

                                      const installProcess = await webContainer.spawn("npm", ["install"]);
                                      installProcess.output.pipeTo(new WritableStream({
                                        write(chunk) {
                                          console.log(chunk)
                                        }
                                      }));

                                      if (runProcess) {
                                        runProcess.kill();
                                      }

                                      let tempRunProcess = await webContainer.spawn("npm", ["start"]);
                                      tempRunProcess.output.pipeTo(new WritableStream({
                                        write(chunk) {
                                          console.log(chunk)
                                        }
                                      }));

                                      setRunProcess(tempRunProcess);
                                      setIsServerRunning(true);
                                      setIframeUrl('http://localhost:3000');
                                      setPreviewError(null);

                                      webContainer.on('server-ready', (port, url) => {
                                        console.log(port, url);
                                        setIframeUrl(url);
                                      });

                                    } catch (error) {
                                      console.error("Error running code:", error);
                                      setPreviewError('Failed to start development server: ' + error);
                                    }
                                  }}
                                  size="sm"
                                  className="h-7 bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                  <i className="ri-play-fill mr-1"></i>
                                  Run
                                </Button>
                              </div>
                              <pre className="h-full hljs bg-neutral-900">
                                <code
                                  className="h-full text-gray-200 scrollbar-hide outline-none hljs bg-neutral-900"
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
                                    padding: '1rem',
                                    fontSize: '14px',
                                    lineHeight: '1.5'
                                  }}
                                />
                              </pre>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-full text-neutral-500">
                              <p>Select a file to edit</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Canvas Tab */}
                  {activeTab === 'canvas' && (
                    <div className="h-full bg-white flex flex-col">
                      <div className="flex justify-between items-center p-3 border-b border-gray-200 bg-white">
                        <h3 className="text-sm font-medium text-gray-700">Live Preview</h3>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={handleRefresh}
                            disabled={isRefreshing || !isServerRunning}
                            className="p-1.5 rounded hover:bg-gray-100 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                            title="Refresh Preview"
                          >
                            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                          </button>
                          {isServerRunning && iframeUrl && (
                            <a
                              href={iframeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs px-2 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
                            >
                              Open in new tab
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 bg-gray-50 relative">
                        {isServerRunning && iframeUrl ? (
                          <iframe
                            ref={iframeRef}
                            src={iframeUrl}
                            className="w-full h-full border-0"
                            title="Live Preview"
                            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                            onError={handleIframeError}
                            onLoad={() => {
                              setIsRefreshing(false);
                              setPreviewError(null);
                            }}
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center p-4">
                              <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
                              <p className="text-gray-500">Development server not running</p>
                              <p className="text-sm text-gray-400 mt-1">Click "Run" in the code editor to start the server</p>
                            </div>
                          </div>
                        )}
                        {previewError && (
                          <div className="absolute inset-0 bg-white p-4 flex flex-col items-center justify-center text-center">
                            <div className="text-red-500 mb-2">
                              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Preview Unavailable</h3>
                            <p className="mt-2 text-sm text-gray-600">{previewError}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>

      {/* Add Collaborators Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative max-w-md w-full p-6 transition-all duration-300 transform border shadow-2xl bg-neutral-800 rounded-2xl border-neutral-700">
            <header className='flex items-center justify-between mb-6'>
              <h2 className='text-xl font-bold text-white'>
                Add Collaborators
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className='p-2 text-gray-400 transition-all duration-200 rounded-lg hover:text-white hover:bg-neutral-700'
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            <div className="mb-6">
              <p className="text-sm text-neutral-400">Select users to add to this project</p>
            </div>

            <div className="max-h-64 scrollbar-hide overflow-y-auto pr-2 mb-6">
              <div className="space-y-2">
                {users.filter(u => !project.users.some(pu => pu._id === u._id)).map(user => (
                  <div
                    key={user._id}
                    className={`user cursor-pointer p-3 flex gap-3 items-center rounded-lg transition-all duration-200 ${Array.from(selectedUserId).includes(user._id) ? 'bg-blue-900/30 border border-blue-700' : "bg-neutral-700/50 hover:bg-neutral-700"}`}
                    onClick={() => handleUserClick(user._id)}
                  >
                    <div className='flex items-center justify-center w-8 h-8 text-white rounded-full bg-gradient-to-br from-blue-600 to-blue-800'>
                      <i className="text-sm ri-user-fill"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className='text-sm font-medium text-gray-200 truncate'>{user.email}</p>
                    </div>
                    {Array.from(selectedUserId).includes(user._id) && (
                      <i className="text-green-400 ri-check-fill"></i>
                    )}
                  </div>
                ))}

                {users.filter(u => !project.users.some(pu => pu._id === u._id)).length === 0 && (
                  <p className="text-center text-neutral-400 py-4">No users available to add</p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2 px-4 text-sm font-medium text-neutral-300 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={addCollaborators}
                disabled={selectedUserId.size === 0}
                className="flex-1 py-2 px-4 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors duration-200"
              >
                Add Selected ({selectedUserId.size})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Project