import { Lock, Mail, User2Icon } from 'lucide-react'
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotes } from '../context/NotesContext'

const Login = () => {
    const navigate = useNavigate()
    const { refreshUser } = useNotes()
    const query = new URLSearchParams(window.location.search)
    const urlState = query.get('state')
    const [state, setState] = React.useState(urlState || "login")

    useEffect(() => {
        if (urlState) {
            setState(urlState)
        }
    }, [urlState])

    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        password: ''
    })

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Admin Login Check (Legacy)
        if (formData.email === 'admin@gmail.com' && formData.password === 'admin123') {
            const adminUser = { name: 'Admin', email: 'admin@gmail.com', id: 'admin', role: 'admin' }
            localStorage.setItem('currentUser', JSON.stringify(adminUser))
            refreshUser()
            navigate('/admin')
            return
        }

        try {
            const endpoint = state === 'register' ? '/api/auth/register' : '/api/auth/login';
            const response = await fetch(`http://localhost:5000${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.error || 'Authentication failed');
                return;
            }

            if (state === 'register') {
                // After successful registration, automatically login
                setState('login');
                alert('Registration successful! Please login.');
            } else {
                // Successful login
                const userWithToken = {
                    ...data.user,
                    token: data.token
                };
                localStorage.setItem('currentUser', JSON.stringify(userWithToken));
                refreshUser();
                navigate('/app');
            }
        } catch (error) {
            console.error('Auth error:', error);
            alert('Something went wrong. Please try again.');
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }
    return (
        <div className='flex items-center justify-center min-h-screen bg-gray-50'>
            <form onSubmit={handleSubmit} className="sm:w-[350px] w-full text-center border border-gray-300/60 rounded-2xl px-8 bg-white">
                <h1 className="text-gray-900 text-3xl mt-10 font-medium">{state === "login" ? "Login" : "Sign up"}</h1>
                <p className="text-gray-500 text-sm mt-2">Please {state} to continue</p>
                {state !== "login" && (
                    <div className="flex items-center mt-6 w-full bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
                        <User2Icon size={16} color='#6B7280' />
                        <input type="text" name="name" placeholder="Name" className="border-none outline-none ring-0" value={formData.name} onChange={handleChange} required />
                    </div>
                )}
                <div className="flex items-center w-full mt-4 bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
                    <Mail size={13} color='#6B7280' />
                    <input type="email" name="email" placeholder="Email id" className="border-none outline-none ring-0" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="flex items-center mt-4 w-full bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
                    <Lock size={13} color='#6B7280' />
                    <input type="password" name="password" placeholder="Password" className="border-none outline-none ring-0" value={formData.password} onChange={handleChange} required />
                </div>
                <div className="mt-4 text-left text-green-500">
                    <button className="text-sm" type="reset">Forget password?</button>
                </div>
                <button type="submit" className="mt-2 w-full h-11 rounded-full text-white bg-green-500 hover:opacity-90 transition-opacity">
                    {state === "login" ? "Login" : "Sign up"}
                </button>
                <p onClick={() => setState(prev => prev === "login" ? "register" : "login")} className="text-gray-500 text-sm mt-3 mb-11">{state === "login" ? "Don't have an account?" : "Already have an account?"} <a href="#" className="text-green-500 hover:underline">click here</a></p>
            </form>
        </div>
    )
}

export default Login