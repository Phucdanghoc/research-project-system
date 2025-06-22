
   import PropTypes from 'prop-types';

   const AddEditTopicModal = ({ isOpen, onClose, onSubmit, formData, onInputChange, statuses, isEdit }) => {
     if (!isOpen) return null;

     return (
       <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
         <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
           <h2 className="text-xl font-bold mb-4">{isEdit ? 'Sửa đề tài' : 'Thêm đề tài'}</h2>
           <form onSubmit={onSubmit}>
             <div className="mb-4">
               <label className="block text-sm font-medium text-gray-700">Tiêu đề</label>
               <input
                 type="text"
                 name="title"
                 value={formData.title}
                 onChange={onInputChange}
                 className="w-full p-2 border border-gray-300 rounded"
                 required
               />
             </div>
             <div className="mb-4">
               <label className="block text-sm font-medium text-gray-700">Mã đề tài</label>
               <input
                 type="text"
                 name="topicCode"
                 value={formData.topicCode}
                 onChange={onInputChange}
                 className="w-full p-2 border border-gray-300 rounded"
                 required
               />
             </div>
             <div className="mb-4">
               <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
               <select
                 name="status"
                 value={formData.status}
                 onChange={onInputChange}
                 className="w-full p-2 border border-gray-300 rounded"
                 required
               >
                 <option value="">Chọn trạng thái</option>
                 {statuses.map((status) => (
                   <option key={status} value={status}>
                     {status}
                   </option>
                 ))}
               </select>
             </div>
             <div className="mb-4">
               <label className="block text-sm font-medium text-gray-700">Mô tả</label>
               <textarea
                 name="description"
                 value={formData.description}
                 onChange={onInputChange}
                 className="w-full p-2 border border-gray-300 rounded"
                 rows="4"
                 required
               ></textarea>
             </div>
             <div className="mb-4">
               <label className="block text-sm font-medium text-gray-700">Yêu cầu</label>
               <textarea
                 name="requirement"
                 value={formData.requirement}
                 onChange={onInputChange}
                 className="w-full p-2 border border-gray-300 rounded"
                 rows="4"
                 required
               ></textarea>
             </div>
             <div className="flex justify-end space-x-2">
               <button
                 type="button"
                 onClick={onClose}
                 className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
               >
                 Hủy
               </button>
               <button
                 type="submit"
                 className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
               >
                 {isEdit ? 'Cập nhật' : 'Thêm'}
               </button>
             </div>
           </form>
         </div>
       </div>
     );
   };

   AddEditTopicModal.propTypes = {
     isOpen: PropTypes.bool.isRequired,
     onClose: PropTypes.func.isRequired,
     onSubmit: PropTypes.func.isRequired,
     formData: PropTypes.shape({
       title: PropTypes.string.isRequired,
       topicCode: PropTypes.string.isRequired,
       status: PropTypes.string.isRequired,
       description: PropTypes.string.isRequired,
       requirement: PropTypes.string.isRequired,
     }).isRequired,
     onInputChange: PropTypes.func.isRequired,
     statuses: PropTypes.arrayOf(PropTypes.string).isRequired,
     isEdit: PropTypes.bool.isRequired,
   };

   export default AddEditTopicModal;