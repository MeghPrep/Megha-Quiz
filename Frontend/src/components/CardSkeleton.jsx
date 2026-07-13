import React from 'react'

const CardSkeleton = () => {
  return (
    <div className='skeleton-card'>
        <div className="skeleton-image pulse"></div>
        <div className="skeleton-title pulse"></div>
        <div className="skeleton-text pulse"></div>
    </div>
  );
}

export default CardSkeleton