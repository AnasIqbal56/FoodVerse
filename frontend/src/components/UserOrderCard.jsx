import React from 'react';

function UserOrderCard({ data }) {
    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-GB',{
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        })
    }
    return (
        <div className="bg -white p-4 rounded-lg shadow p-4 space-y-4">
            <div className='flex justify-between border-b pb-2'>
                <div>
                    <p className='font-semibold'>
                        order <div id={data._id.slice(-6)}></div>
                    </p>
                    <p className='text-sm text-gray-500'>
                        Date: {formatDate(data.createdAt)}
                    </p>
                </div>
                <div className='text-right'>
                    <p className='text-sm text-gray-500'>
                        {data.paymentMethod ?.toUpperCase()}
                    </p>

                    <p className='font-medium text-blue-600'>
                        {data.shopOrders?.[0].status}
                    </p>

                </div>
            </div>


        </div>
    );
}

export default UserOrderCard;