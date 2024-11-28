import React, { useEffect, useState } from 'react';
import { connectWallet, getArtMarketplaceDAppTokenContract } from '../contracts/ArtMarketplaceDAppToken';
import { parseEther } from 'ethers/utils';
import { useNavigate, useOutletContext } from 'react-router-dom';

const Profile = () => {
    const { account } = useOutletContext();
    const [myArtworks, setMyArtworks] = useState([]);
    const [imageUrl, setImageUrl] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [price, setPrice] = useState('');
    const navigate = useNavigate();
    const ethers18 = 10 ** 18;

    const handleSellArt = async () => {
        try {
            if (!window.ethereum.isConnected()) return alert('Please connect your wallet first.');

            const { signer } = await connectWallet();
            const contract = getArtMarketplaceDAppTokenContract(signer);
            
            const response = await contract.listArtwork(name, description, imageUrl, category, parseEther(price));
            await response.wait();
            alert('Artwork listed successfully!');

            setName('');
            setDescription('');
            setImageUrl('');
            setCategory('');
            setPrice('');
            fetchMyArtworks(); 
        } catch (error) {
            console.error("Error listing artwork:", error);
        }
    };

    const  fetchMyArtworks = async () => {
        try {
            const { signer } = await connectWallet();
            const contract = getArtMarketplaceDAppTokenContract(signer);

            const count = await contract.artworkCount();
            const artworks = [];

            for (let i = 1; i <= count; i++) {
                const artwork = await contract.artworks(i);
                if (artwork.owner.toLowerCase() === account.toLowerCase()) {
                    artworks.push(artwork);
                }
            }

            setMyArtworks(artworks);
        } catch (error) {
            console.error("Error fetching artworks:", error);
        }
    };

    const handleArtworkClick = (id) => {
        navigate(`/artwork/${id}`); 
    };

    useEffect(() => {
        if (account) {
            fetchMyArtworks(); 
        }
    }, [account]);

    return (
        <div>
            <h2>Profile</h2>
            <p>{account ? `Wallet Address: ${account}` : 'No wallet connected, connect your wallet first.'}</p>
            <br /><br /><br />

            <h3>My Artworks</h3>            
            <div className="artwork-grid">
                {myArtworks.map((artwork) => (
                    <div key={artwork.id} className="artwork-card" onClick={() => handleArtworkClick(artwork.id)}>
                        <img src={artwork.imageUrl} alt={artwork.name} />
                        <p>{artwork.name}</p>
                        <p>{artwork.description}</p>
                        <p>{artwork.category}</p>                        
                        <p>{(Number(artwork.price)) / ethers18} ADT</p>
                    </div>
                ))}
            </div>            
            <br /><br /><br />

            <h3>Sell Artwork</h3>
            <div>
                <label>Image URL: </label>
                <input
                    type="text"
                    placeholder="Enter image URL"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                />
            </div>
            <br />

            <div>
                <label>Artwork Name: </label>
                <input
                    type="text"
                    placeholder="Enter artwork name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>
            <br />            

            <div>
                <label>Artwork Description: </label>
                <input
                    type="text"
                    placeholder="Enter description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>
            <br />

            <label>Price (in ADT): </label>
            <input
                type="text"
                placeholder="Enter price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
            />
            <br /><br />

            <div>
                <label>Category: </label>
                <select 
                    className='category-dropdown'
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                >
                    <option value="">Select a Category</option>
                    <option value="Abstract">Abstract</option>
                    <option value="Drawing">Drawing</option>
                    <option value="Digital Art">Digital Art</option>
                    <option value="3D Modeling">3D Modeling</option>
                    <option value="Illustration">Illustration</option>
                    <option value="Photography">Photography</option>
                    <option value="Animation">Animation</option>
                    <option value="Other">Other</option>
                </select>
            </div>
            <br />
            
            <br />
            <button className='button' onClick={handleSellArt}>Sell</button>
        </div>
    );
};

export default Profile;
