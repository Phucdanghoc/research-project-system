import { useState } from 'react';
import PropTypes from 'prop-types';

const CardTopic = ({ topic }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className=" p-6 max-w-md mx-auto">
            <div className="grid grid-cols-1 gap-4">
                <div>
                    <h5 className="text-xl font-bold text-gray-900">{topic.title}</h5>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <p className="text-sm text-gray-600"><span className="font-semibold">ID:</span> {topic.id}</p>
                        <p className="text-sm text-gray-600"><span className="font-semibold">Code:</span> {topic.topicCode}</p>
                        <p className="text-sm text-gray-600"><span className="font-semibold">Status:</span> {topic.status}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600"><span className="font-semibold">Created:</span> {new Date(topic.createdAt).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-600"><span className="font-semibold">Updated:</span> {new Date(topic.updateAt).toLocaleDateString()}</p>
                    </div>
                </div>
                {isExpanded && (
                    <div className="grid grid-cols-1 gap-2">
                        <p className="text-sm text-gray-600"><span className="font-semibold">Description:</span> {topic.description}</p>
                        <p className="text-sm text-gray-600"><span className="font-semibold">Requirement:</span> {topic.requirement}</p>
                    </div>
                )}
                <div>
                    <button
                        onClick={toggleExpand}
                        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
                    >
                        {isExpanded ? 'Less' : 'More'}
                    </button>
                </div>
            </div>
        </div>
    );
};

CardTopic.propTypes = {
    topic: PropTypes.shape({
        id: PropTypes.number.isRequired,
        title: PropTypes.string.isRequired,
        topicCode: PropTypes.string.isRequired,
        createdAt: PropTypes.string.isRequired,
        updateAt: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        requirement: PropTypes.string.isRequired,
    }).isRequired,
};

export default CardTopic;