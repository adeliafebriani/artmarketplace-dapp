import React, { useState } from 'react';
import ArtworkListing from './ArtworkListing';
import Profile from './Profile';

const Marketplace = () => {
    const [selectedCategory, setSelectedCategory] = useState('All');

    return (
        <div>
            <ArtworkListing selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
            <Profile selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
        </div>
    );
};

export default Marketplace;
