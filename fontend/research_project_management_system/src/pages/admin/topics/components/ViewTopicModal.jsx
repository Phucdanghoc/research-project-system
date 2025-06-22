
   import PropTypes from 'prop-types';

   const ViewTopicModal = ({ isOpen, onClose, topic }) => {
     if (!isOpen || !topic) return null;

     return (
       <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
         <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
           <h2 className="text-xl font-bold mb-4">Chi tiết đề tài</h2>
           <p className="mb-2"><span className="font-semibold">ID:</span> {topic.id}</p>
           <p className="mb-2"><span className="font-semibold">Tiêu đề:</span> {topic.title}</p>
           <p className="mb-2"><span className="font-semibold">Mã đề tài:</span> {topic.topicCode}</p>
           <p className="mb-2"><span className="font-semibold">Trạng thái:</span> {topic.status}</p>
           <p className="mb-2"><span className="font-semibold">Ngày tạo:</span> {new Date(topic.createdAt).toLocaleDateString()}</p>
           <p className="mb-2"><span className="font-semibold">Ngày cập nhật:</span> {new Date(topic.updateAt).toLocaleDateString()}</p>
           <p className="mb-2"><span className="font-semibold">Mô tả:</span> {topic.description}</p>
           <p className="mb-2"><span className="font-semibold">Yêu cầu:</span> {topic.requirement}</p>
           <div className="flex justify-end">
             <button
               onClick={onClose}
               className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
             >
               Đóng
             </button>
           </div>
         </div>
       </div>
     );
   };

   ViewTopicModal.propTypes = {
     isOpen: PropTypes.bool.isRequired,
     onClose: PropTypes.func.isRequired,
     topic: PropTypes.shape({
       id: PropTypes.number.isRequired,
       title: PropTypes.string.isRequired,
       topicCode: PropTypes.string.isRequired,
       createdAt: PropTypes.string.isRequired,
       updateAt: PropTypes.string.isRequired,
       status: PropTypes.string.isRequired,
       description: PropTypes.string.isRequired,
       requirement: PropTypes.string.isRequired,
     }),
   };

   export default ViewTopicModal;