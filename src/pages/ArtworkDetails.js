import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAdTokenContract } from '../contracts/AdToken';
import { connectWallet, getArtMarketplaceDAppTokenContract } from '../contracts/ArtMarketplaceDAppToken';
import { formatEther, parseEther } from 'ethers/utils';

//add event to not refresh in the smart contract

const ArtworkDetails = () => {
    const { id } = useParams();
    const [artwork, setArtwork] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [price, setPrice] = useState('');
    const [account, setAccount] = useState('');
    const [reviews, setReviews] = useState([]);
    const [error, setError] = useState('');
    const [reviewComment, setReviewComment] = useState('');
    const [isReviewing, setIsReviewing] = useState(false); 
    const navigate = useNavigate();

    const fetchArtworkDetails = async () => {
        try {
            const { signer } = await connectWallet();
            const contract = getArtMarketplaceDAppTokenContract(signer);
            const artworkData = await contract.artworks(id);

            setArtwork(artworkData);
            setName(artworkData.name);
            setDescription(artworkData.description);
            setImageUrl(artworkData.imageUrl);
            setCategory(artworkData.category);
            setPrice(formatEther(artworkData.price.toString())); 
            
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            setAccount(accounts[0]); 

            const reviewsData = await contract.getArtworkReviews(id);
            setReviews(reviewsData);
        } catch (error) {
            console.error("Error fetching artwork details:", error);
        }
    };

    const handleEditArtwork = async () => {
        try {
            const { signer } = await connectWallet();
            const contract = getArtMarketplaceDAppTokenContract(signer);
            
            const response = await contract.editArtwork(id, imageUrl, name, description, category, parseEther(price));
            await response.wait();
            alert('Artwork updated successfully!');
            
            setIsEditing(false);
            fetchArtworkDetails();
        } catch (error) {
            console.error("Error updating artwork:", error);
        }
    };

    const handleDeleteArtwork = async () => {
        try {
            const { signer } = await connectWallet();
            const contract = getArtMarketplaceDAppTokenContract(signer);

            const response = await contract.deleteArtwork(id);
            await response.wait();
            alert('Artwork deleted successfully!');

            navigate('/'); 
        } catch (error) {
            console.error("Error deleting artwork:", error);
        }
    };

    const handleBuyArtwork = async () => {
        try {
            const { signer } = await connectWallet();
            const adToken = getAdTokenContract(signer);
            const contract = getArtMarketplaceDAppTokenContract(signer);
            
            const artwork = await contract.artworks(id);
            const price = artwork.price;

            const approvalResponse = await adToken.approve('0xc682B57fEf25E2A349d51Cc99E6519996f7BDa97', price); 
            await approvalResponse.wait(); 
            console.log('AdToken approval successful!');
    
            const purchaseResponse = await contract.buyArtwork(id);
            console.log(purchaseResponse);
            await purchaseResponse.wait();
            alert('Artwork purchased successfully!');

            setIsReviewing(true);       
            fetchArtworkDetails();
        } catch (error) {
            console.error("Error purchasing artwork:", error);
            setError("Failed to purchase artwork. Please check the console for details.");
        }     
    };    

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        try {
            const { signer } = await connectWallet();
            const contract = getArtMarketplaceDAppTokenContract(signer);

            const response = await contract.submitReview(id, reviewComment);
            await response.wait(); 
            alert('Review submitted successfully!');

            setReviewComment('');
            setIsReviewing(false);
            fetchArtworkDetails();
        } catch (error) {
            console.error("Error submitting review:", error);
            setError("Failed to submit review. Please check the console for details.");
        }
    };

    useEffect(() => {
        fetchArtworkDetails();
    }, [id]);

    const isOwner = artwork.owner && account && artwork.owner.toLowerCase() === account.toLowerCase();
    const ethers18 = 10**18;

    return (
        <div>
            <h2>Artwork Details</h2>
            <div className="artwork-card">
                <img src={artwork.imageUrl} alt={artwork.name} />
                <p><strong>Artwork Name:</strong> {artwork.name}</p>
                <p><strong>Description:</strong> {artwork.description}</p>
                <p><strong>Price:</strong> {Number(artwork.price)/ethers18} ADT</p>
                <p><strong>Category:</strong> {artwork.category}</p>
                <p><strong>Owner:</strong> {artwork.owner}</p>
                <p><strong>Status:</strong> {artwork.sold ? 'Sold' : 'Available'}</p>
                <br />

                {isOwner ? (
                    <>
                        <button className="button" onClick={handleDeleteArtwork}>Delete Artwork</button>
                        <br />
                        <button className="button" onClick={() => setIsEditing(true)}>Edit Artwork</button>
                    </>
                ) : (
                    !artwork.sold && (
                        <button className="button" onClick={handleBuyArtwork}>Buy Artwork</button>
                    )
                )}
                {error && <p className="error-message">{error}</p>}
            </div>

            <br />
            {isEditing && (
                <div className="edit-form">
                    <h3>Edit Artwork</h3>
                    <form>
                        <br />
                        <div>
                            <label>Artwork Name:</label>
                            <input 
                                type="text" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                            />
                        </div>
                        <br />
                        <div>
                            <label>Artwork Description:</label>
                            <input 
                                type="text" 
                                value={description} 
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <br />
                        <div>
                            <label>Image URL:</label>
                            <input 
                                type="text" 
                                value={imageUrl} 
                                onChange={(e) => setImageUrl(e.target.value)} 
                            />
                        </div>    

                        <br />
                        <div>
                            <label>Category:</label>
                            <select 
                                className='category-dropdown'
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >                                
                                <option value="">Select Category</option>
                                <option value="Abstract">Abstract</option>
                                <option value="Drawing">Drawing</option>
                                <option value="Digital Art">Digital Art</option>
                                <option value="3D Animation">3D Animation</option>
                                <option value="Illustration">Illustration</option>
                                <option value="Photography">Photography</option>
                                <option value="Animation">Animation</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <br />
                        <div>
                            <label>Price (in ADT):</label>
                            <input 
                                type="text" 
                                value={price} 
                                onChange={(e) => setPrice(e.target.value)}
                            />
                        </div>

                        <br />
                        <button className="button" onClick={handleEditArtwork}>Save Changes</button>
                    </form>
                </div>
            )}

            <br />
            <h3>Reviews</h3>
            <div>
                {reviews.length > 0 ? (
                    reviews.map((review, index) => (
                        <div key={index} className="review-card">
                            <p><strong>{review.reviewer}</strong></p>
                            <p><br />{review.comment}</p>
                        </div>
                    ))
                ) : (
                    <p>No reviews yet.</p>
                )}
            </div>

            <br />
            {isReviewing && (
                <div className="review-form">
                    <h3>Leave a Review</h3>
                    <br />
                    <form onSubmit={handleReviewSubmit}>
                        <div>
                            <label>Review Comment:</label>
                            <input 
                                type="text" 
                                value={reviewComment} 
                                onChange={(e) => setReviewComment(e.target.value)} 
                            />
                        </div>

                        <br />
                        <button type="submit" className="button">Submit Review</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ArtworkDetails;
