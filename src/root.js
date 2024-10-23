import React, { useState } from 'react';
import { createBrowserRouter, NavLink, Outlet } from 'react-router-dom';
import ArtworkListing from './pages/ArtworkListing';
import ArtworkDetails from './pages/ArtworkDetails';
import Profile from './pages/Profile';
import { connectWallet } from './contracts/ArtMarketplaceDAppToken';
import { FaSearch } from "react-icons/fa";
import { atomWithStorage } from 'jotai/utils';
import { useAtom } from 'jotai';

export const accountAtom = atomWithStorage('');

export const Root = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [account, setAccount] = useAtom(accountAtom);
    const [isWalletConnected, setIsWalletConnected] = useState(false);

    const handleWalletConnection = async () => {
        try {
            if (!window.ethereum || !window.ethereum.isConnected()) {
                return alert('Please connect your wallet first.');
            }

            const { account } = await connectWallet();
            setAccount(account);
            setIsWalletConnected(true);
        } catch (error) {
            console.error(error?.message);
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    window.ethereum?.on('accountsChanged', accounts => {
        const account = accounts?.length > 0 ? accounts[0] : '';
        setAccount(account);
        setIsWalletConnected(!!account);
    });

    return (
        <header>
            <nav className='nav'>
                <NavLink to='/' style={({ isActive }) => (isActive ? { color: 'red' } : {})}>
                    Home
                </NavLink>                
                <NavLink to="/profile" style={({ isActive }) => (isActive ? { color: 'red' } : {})}>
                    Profile
                </NavLink>
                
                <nav className='searchBar'>
                    <FaSearch /> 
                    <input 
                        type="text" 
                        placeholder="Search by name or category of artworks..." 
                        value={searchQuery} 
                        onChange={handleSearchChange} 
                    />                                  
                </nav>
                
                <button className='walletButton' onClick={handleWalletConnection}>
                    {`Connected Wallet ${account && account.substring(0, 5)}...${account && account.substring(35, account.length)}`}
                </button>
            </nav>

            <Outlet context={{ account, searchQuery, setSearchQuery }} /> {/* Pass down searchQuery and setSearchQuery */}
        </header>
    );
};

export const routes = createBrowserRouter([
    {
        path: '/',
        element: <Root />,
        children: [
            { 
                index: true, 
                element: <ArtworkListing /> 
            },
            { 
                path: 'profile', 
                element: <Profile />  
            },
            { 
                path: '/artwork/:id', 
                element: <ArtworkDetails /> 
            }           
        ],
    },
]);
