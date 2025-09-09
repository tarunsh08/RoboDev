import React, {createContext, useState, useEffect, useContext} from "react";
import axios from "../config/axios";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Set the default authorization header
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    // Fetch the current user's data
                    const response = await axios.get('/users/me');
                    setUser(response.data);
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    localStorage.removeItem('token');
                    delete axios.defaults.headers.common['Authorization'];
                }
            }
            setIsLoading(false);
        };

        checkAuth();
    }, []);

    const login = (token, userData) => {
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
    };

    return (
        <UserContext.Provider value={{ user, setUser, isLoading, login, logout }}>
            {!isLoading && children}
        </UserContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(UserContext);
};
