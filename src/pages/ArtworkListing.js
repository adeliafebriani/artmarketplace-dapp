import React, { useEffect, useState } from 'react';
import { connectWallet, getArtMarketplaceDAppTokenContract } from '../contracts/ArtMarketplaceDAppToken';
import { useNavigate, useOutletContext } from 'react-router-dom';

const ArtworkListing = () => {
    const { searchQuery, setSearchQuery } = useOutletContext(); 
    const [artworks, setArtworks] = useState([]);
    const [filteredArtworks, setFilteredArtworks] = useState([]);
    const [account, setAccount] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('');
    const navigate = useNavigate();
    const ethers18 = 10 ** 18;

    const fetchArtworks = async () => {
        setLoading(true);
        try {
            if (!window.ethereum.isConnected()) return alert('Please connect your wallet first.');

            const { signer } = await connectWallet();
            const contract = getArtMarketplaceDAppTokenContract(signer);
            const count = await contract.artworkCount();
            const artworksList = [];

            for (let i = 1; i <= count; i++) {
                const artwork = await contract.artworks(i);
                if (artwork.name !== ''){
                    artworksList.push(artwork);            
                }      
            }

            setArtworks(artworksList);
            setFilteredArtworks(artworksList);
        } catch (error) {
            console.error("Error fetching artworks:", error);
        }
    };

    const handleArtworkClick = (id) => {
        navigate(`/artwork/${id}`);
    };

    const filterArtworks = () => {
        const lowerCaseQuery = searchQuery.toLowerCase();
        const filtered = artworks.filter((artwork) => 
            (artwork.name && artwork.name.toLowerCase().includes(lowerCaseQuery)) ||
            (artwork.category && artwork.category.toLowerCase().includes(lowerCaseQuery))
        );

        const finalFiltered = selectedCategory === ''
            ? filtered
            : filtered.filter(artwork => artwork.category === selectedCategory);

        setFilteredArtworks(finalFiltered);
    };

    useEffect(() => {
        fetchArtworks(); 
    }, [account]);

    useEffect(() => {
        filterArtworks(); 
    }, [searchQuery, artworks, selectedCategory]);

    const getCategories = () => {
        return [
            "Select a Category",
            "Abstract",
            "Drawing",
            "Digital Art",
            "3D Modeling",
            "Illustration",
            "Photography",
            "Animation",
            "Other"
        ];
    };

    const handleCategoryChange = (event) => {
        setSelectedCategory(event.target.value);
    };

    return (
        <div>
            <h2>All Artworks</h2>
            <div >
            <select 
                className="selectedCategory-dropdown"
                value={selectedCategory} 
                onChange={handleCategoryChange}
            >
                {getCategories().map((category, index) => (
                    <option key={index} value={category}>
                        {category}
                    </option>
                ))}
            </select>
            </div>

            <div className="artwork-grid">
                {filteredArtworks.length > 0 ? (
                    filteredArtworks.map((artwork) => ( 
                        !artwork.sold && (
                            <div 
                                key={artwork.id} 
                                className="artwork-card" 
                                onClick={() => handleArtworkClick(artwork.id)}>
                                    
                                <img src={artwork.imageUrl} alt={artwork.name} />
                                <p>{artwork.name}</p>
                                <p>{(Number(artwork.price)) / ethers18} ADT</p>
                            </div>
                        )
                    ))
                ) : (
                    <p>No artworks found matching your criteria.</p> 
                )}
            </div>

            <br /><br /><br />
        </div>
    );
};

export default ArtworkListing;
