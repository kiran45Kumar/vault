import api from "../api/axios";

export const bulkMoveToTrash = async (ids, token) => {
    return await api.post(
        "/documents/delete_all/",
        { ids },
        {
            headers: { Authorization: `Bearer ${token}` }
        }
    );
};


export const bulkRestore = async (ids, token) => {
    return await api.post(
        "/documents/restore_all/",
        { ids },
        {
            headers: { Authorization: `Bearer ${token}` }
        }
    );
};


export const bulkPermanentDelete = async (ids, token) => {
    return await api.post(
        "/documents/permanent_delete_all/",
        { ids },    
        {
            headers: { Authorization: `Bearer ${token}` }
        }
    );
}