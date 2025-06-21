import { useContext, useState, useEffect } from 'react'
import { UserContext } from '../context/user.context'
import axios from "../config/axios"
import { useNavigate } from 'react-router-dom'

const Home = () => {

    const { user } = useContext(UserContext)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [projectName, setProjectName] = useState('')
    const [project, setProject] = useState([])
    const [activeTab, setActiveTab] = useState('projects')
    const [openFAQ, setOpenFAQ] = useState(null)

    const navigate = useNavigate()

    function createProject(e) {
        e.preventDefault()
        console.log({ projectName })

        axios.post('/projects/create', {
            name: projectName,
        })
            .then((res) => {
                console.log(res)
                setIsModalOpen(false)
                setProjectName('')
                // Refresh projects list
                fetchProjects()
            })
            .catch((error) => {
                console.log(error)
            })
    }

    const fetchProjects = () => {
        axios.get('/projects/all').then((res) => {
            setProject(res.data.projects)
        }).catch(err => {
            console.log(err)
        })
    }

    useEffect(() => {
        fetchProjects()
    }, [])

    const features = [
        {
            icon: 'ri-code-s-slash-fill',
            title: 'Real-time Collaboration',
            description: 'Work together with your team in real-time, see changes instantly, and communicate seamlessly.'
        },
        {
            icon: 'ri-terminal-box-fill',
            title: 'Integrated Terminal',
            description: 'Built-in terminal and package management. Run your projects directly in the browser.'
        },
        {
            icon: 'ri-file-code-fill',
            title: 'Smart Code Editor',
            description: 'Syntax highlighting, auto-completion, and intelligent code suggestions powered by AI.'
        },
        {
            icon: 'ri-team-fill',
            title: 'Team Management',
            description: 'Easily add collaborators, manage permissions, and track project contributions.'
        },
        {
            icon: 'ri-cloud-fill',
            title: 'Cloud Storage',
            description: 'Your projects are automatically saved and synced across all devices.'
        },
        {
            icon: 'ri-rocket-fill',
            title: 'Instant Deployment',
            description: 'Deploy your projects instantly with our integrated hosting platform.'
        }
    ]

    const faqs = [
        {
            question: 'How do I create a new project?',
            answer: 'Click the "New Project" button, enter your project name, and start coding immediately. You can invite collaborators anytime.'
        },
        {
            question: 'Can I work offline?',
            answer: 'While our platform is cloud-based, we cache your work locally. You can continue coding offline and sync when you reconnect.'
        },
        {
            question: 'How many collaborators can I add?',
            answer: 'You can add unlimited collaborators to your projects. All team members can edit, comment, and contribute in real-time.'
        },
        {
            question: 'What programming languages are supported?',
            answer: 'We support JavaScript and its oriented frameworks with syntax highlighting.'
        },
        {
            question: 'Is my code secure?',
            answer: 'Yes, we use enterprise-grade encryption and security measures to protect your code and data.'
        },
        {
            question: 'Can I export my projects?',
            answer: 'Absolutely! You can export your projects at any time in various formats or clone them to your local machine.'
        }
    ]

    const steps = [
        {
            step: '01',
            title: 'Create Your Project',
            description: 'Start by creating a new project with a descriptive name.',
            icon: 'ri-add-circle-fill'
        },
        {
            step: '02',
            title: 'Invite Collaborators',
            description: 'Add team members to collaborate on your project in real-time.',
            icon: 'ri-user-add-fill'
        },
        {
            step: '03',
            title: 'Code Together',
            description: 'Write code, chat, and see changes instantly as you work together.',
            icon: 'ri-code-s-slash-fill'
        },
        {
            step: '04',
            title: 'Deploy & Share',
            description: 'Run your project and share it with the world instantly.',
            icon: 'ri-rocket-fill'
        }
    ]

    return (
        <div className='min-h-screen text-white bg-slate-900'>
            {/* Navigation */}
            <nav className='fixed top-0 z-50 w-full border-b bg-slate-900/95 backdrop-blur-sm border-slate-800'>
                <div className='px-4 mx-auto max-w-7xl sm:px-6 lg:px-8'>
                    <div className='flex items-center justify-between h-16'>
                        <div className='flex items-center gap-8'>
                            <div className='flex items-center gap-2'>
                                <div className='flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600'>
                                    <i className='text-white ri-code-s-slash-fill'></i>
                                </div>
                                <span className='text-xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text'>
                                    CodeCollab
                                </span>
                            </div>
                            <div className='items-center hidden gap-6 md:flex'>
                                <button 
                                    onClick={() => setActiveTab('projects')}
                                    className={`px-3 py-2 rounded-lg transition-colors ${activeTab === 'projects' ? 'text-blue-400 bg-slate-800' : 'text-gray-300 hover:text-white'}`}
                                >
                                    Projects
                                </button>
                                <button 
                                    onClick={() => setActiveTab('features')}
                                    className={`px-3 py-2 rounded-lg transition-colors ${activeTab === 'features' ? 'text-blue-400 bg-slate-800' : 'text-gray-300 hover:text-white'}`}
                                >
                                    Features
                                </button>
                                <button 
                                    onClick={() => setActiveTab('how-to')}
                                    className={`px-3 py-2 rounded-lg transition-colors ${activeTab === 'how-to' ? 'text-blue-400 bg-slate-800' : 'text-gray-300 hover:text-white'}`}
                                >
                                    How to Use
                                </button>
                                <button 
                                    onClick={() => setActiveTab('faq')}
                                    className={`px-3 py-2 rounded-lg transition-colors ${activeTab === 'faq' ? 'text-blue-400 bg-slate-800' : 'text-gray-300 hover:text-white'}`}
                                >
                                    FAQ
                                </button>
                            </div>
                        </div>
                        <div className='flex items-center gap-4'>
                            <span className='text-sm text-gray-400'>Welcome, {user?.email}</span>
                            <div className='flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600'>
                                <i className='text-sm text-white ri-user-fill'></i>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            {activeTab === 'projects' && (
                <section className='px-4 pt-32 pb-20'>
                    <div className='mx-auto text-center max-w-7xl'>
                        <h1 className='mb-6 text-6xl font-bold text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text'>
                            Code Together,
                            <br />
                            Build Amazing Things
                        </h1>
                        <p className='max-w-3xl mx-auto mb-12 text-xl text-gray-400'>
                            The ultimate collaborative coding platform. Write, debug, and deploy with your team in real-time.
                            No setup required, just pure coding bliss.
                        </p>
                        <div className='flex flex-col items-center justify-center gap-4 sm:flex-row'>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className='px-8 py-4 text-lg font-semibold transition-all duration-300 transform shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 hover:scale-105 hover:shadow-xl'
                            >
                                <i className='mr-2 ri-add-fill'></i>
                                Create Your First Project
                            </button>
                            <button className='px-8 py-4 text-lg font-semibold transition-all duration-300 border border-slate-600 rounded-xl hover:bg-slate-800'>
                                <i className='mr-2 ri-play-fill'></i>
                                Watch Demo
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {/* Projects Section */}
            {activeTab === 'projects' && (
                <section className='px-4 py-20'>
                    <div className='mx-auto max-w-7xl'>
                        <h2 className='mb-12 text-3xl font-bold text-center'>Your Projects</h2>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="group p-8 border-2 border-dashed border-slate-600 rounded-2xl hover:border-blue-500 transition-all duration-300 flex flex-col items-center justify-center min-h-[200px] hover:bg-slate-800/50"
                            >
                                <div className='flex items-center justify-center w-16 h-16 mb-4 transition-transform rounded-full bg-gradient-to-r from-blue-600 to-purple-600 group-hover:scale-110'>
                                    <i className="text-2xl text-white ri-add-fill"></i>
                                </div>
                                <h3 className='text-lg font-semibold text-gray-300 group-hover:text-white'>New Project</h3>
                                <p className='mt-2 text-sm text-gray-500'>Start coding something amazing</p>
                            </button>

                            {project.map((proj) => (
                                <div 
                                    key={proj._id}
                                    onClick={() => navigate(`/project`, { state: { project: proj } })}
                                    className="p-6 transition-all duration-300 transform border cursor-pointer group bg-slate-800/50 rounded-2xl hover:bg-slate-800 border-slate-700 hover:border-slate-600 hover:shadow-xl hover:scale-105"
                                >
                                    <div className='flex items-center justify-between mb-4'>
                                        <div className='flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600'>
                                            <i className='text-white ri-folder-fill'></i>
                                        </div>
                                        <span className='px-2 py-1 text-xs text-gray-400 rounded bg-slate-700'>Active</span>
                                    </div>
                                    <h3 className="mb-3 text-lg font-semibold text-white transition-colors group-hover:text-blue-400">
                                        {proj.name}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                        <i className="ri-team-fill"></i>
                                        <span>{proj.users.length} collaborator{proj.users.length !== 1 ? 's' : ''}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                                        <i className="ri-time-fill"></i>
                                        <span>Updated 2 hours ago</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Features Section */}
            {activeTab === 'features' && (
                <section className='px-4 pt-32 pb-20'>
                    <div className='mx-auto max-w-7xl'>
                        <div className='mb-20 text-center'>
                            <h2 className='mb-6 text-5xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text'>
                                Powerful Features
                            </h2>
                            <p className='max-w-3xl mx-auto text-xl text-gray-400'>
                                Everything you need to collaborate, code, and deploy amazing projects with your team.
                            </p>
                        </div>
                        <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
                            {features.map((feature, index) => (
                                <div key={index} className='p-8 transition-all duration-300 border bg-slate-800/50 rounded-2xl border-slate-700 hover:border-slate-600 hover:shadow-xl group'>
                                    <div className='flex items-center justify-center w-16 h-16 mb-6 transition-transform rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 group-hover:scale-110'>
                                        <i className={`${feature.icon} text-2xl text-white`}></i>
                                    </div>
                                    <h3 className='mb-4 text-xl font-semibold text-white'>{feature.title}</h3>
                                    <p className='leading-relaxed text-gray-400'>{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* How to Use Section */}
            {activeTab === 'how-to' && (
                <section className='px-4 pt-32 pb-20'>
                    <div className='mx-auto max-w-7xl'>
                        <div className='mb-20 text-center'>
                            <h2 className='mb-6 text-5xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text'>
                                How It Works
                            </h2>
                            <p className='max-w-3xl mx-auto text-xl text-gray-400'>
                                Get started in minutes with our simple, intuitive workflow.
                            </p>
                        </div>
                        <div className='relative'>
                            <div className='absolute w-1 h-full transform -translate-x-1/2 rounded-full left-1/2 bg-gradient-to-b from-blue-500 to-purple-500 opacity-30'></div>
                            {steps.map((step, index) => (
                                <div key={index} className={`relative flex items-center mb-16 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                                    <div className={`w-1/2 ${index % 2 === 0 ? 'pr-12' : 'pl-12'}`}>
                                        <div className='p-8 border bg-slate-800/50 rounded-2xl border-slate-700'>
                                            <div className='flex items-center gap-4 mb-4'>
                                                <span className='text-3xl font-bold text-blue-400'>{step.step}</span>
                                                <i className={`${step.icon} text-2xl text-purple-400`}></i>
                                            </div>
                                            <h3 className='mb-4 text-2xl font-semibold text-white'>{step.title}</h3>
                                            <p className='text-lg leading-relaxed text-gray-400'>{step.description}</p>
                                        </div>
                                    </div>
                                    <div className='absolute w-6 h-6 transform -translate-x-1/2 border-4 rounded-full left-1/2 bg-gradient-to-r from-blue-500 to-purple-500 border-slate-900'></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* FAQ Section */}
            {activeTab === 'faq' && (
                <section className='px-4 pt-32 pb-20'>
                    <div className='max-w-4xl mx-auto'>
                        <div className='mb-20 text-center'>
                            <h2 className='mb-6 text-5xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text'>
                                Frequently Asked Questions
                            </h2>
                            <p className='text-xl text-gray-400'>
                                Got questions? We've got answers to help you get started.
                            </p>
                        </div>
                        <div className='space-y-4'>
                            {faqs.map((faq, index) => (
                                <div key={index} className='overflow-hidden border bg-slate-800/50 rounded-2xl border-slate-700'>
                                    <button
                                        onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                                        className='flex items-center justify-between w-full p-6 text-left transition-colors hover:bg-slate-800'
                                    >
                                        <h3 className='text-lg font-semibold text-white'>{faq.question}</h3>
                                        <i className={`ri-arrow-down-s-line text-xl text-gray-400 transition-transform ${openFAQ === index ? 'rotate-180' : ''}`}></i>
                                    </button>
                                    {openFAQ === index && (
                                        <div className='px-6 pb-6 leading-relaxed text-gray-400'>
                                            {faq.answer}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Footer */}
            <footer className='px-4 py-12 border-t bg-slate-800/50 border-slate-700'>
                <div className='mx-auto text-center max-w-7xl'>
                    <div className='flex items-center justify-center gap-2 mb-4'>
                        <div className='flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600'>
                            <i className='text-white ri-code-s-slash-fill'></i>
                        </div>
                        <span className='text-xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text'>
                            CodeCollab
                        </span>
                    </div>
                    <p className='mb-6 text-gray-400'>
                        Empowering developers to build amazing things together.
                    </p>
                    <div className='flex justify-center gap-6'>
                        <a href='#' className='text-gray-400 transition-colors hover:text-white'>
                            <i className='text-xl ri-github-fill'></i>
                        </a>
                        <a href='#' className='text-gray-400 transition-colors hover:text-white'>
                            <i className='text-xl ri-twitter-fill'></i>
                        </a>
                        <a href='#' className='text-gray-400 transition-colors hover:text-white'>
                            <i className='text-xl ri-linkedin-fill'></i>
                        </a>
                        <a href='#' className='text-gray-400 transition-colors hover:text-white'>
                            <i className='text-xl ri-discord-fill'></i>
                        </a>
                    </div>
                </div>
            </footer>

            {/* Create Project Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="relative w-full max-w-md p-8 mx-4 border shadow-2xl bg-slate-800 rounded-2xl border-slate-700">
                        <div className='flex items-center justify-between mb-6'>
                            <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">
                                Create New Project
                            </h2>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className='p-2 text-gray-400 transition-colors rounded-lg hover:text-white hover:bg-slate-700'
                            >
                                <i className='text-xl ri-close-fill'></i>
                            </button>
                        </div>
                        <form onSubmit={createProject} className='space-y-6'>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-300">
                                    Project Name
                                </label>
                                <input
                                    onChange={(e) => setProjectName(e.target.value)}
                                    value={projectName}
                                    type="text"
                                    placeholder="Enter your project name..."
                                    className="w-full p-4 text-white placeholder-gray-400 transition-all border outline-none bg-slate-700 border-slate-600 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                    required
                                />
                            </div>
                            <div className="flex gap-4">
                                <button 
                                    type="button" 
                                    className="flex-1 px-6 py-3 font-medium text-gray-300 transition-colors bg-slate-700 rounded-xl hover:bg-slate-600" 
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="flex-1 px-6 py-3 font-medium text-white transition-all transform shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 hover:shadow-xl hover:scale-105"
                                >
                                    Create Project
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Home