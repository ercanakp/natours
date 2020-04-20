/* eslint-disable */

import axios from 'axios';
import {
    showAlert
} from './alerts';

// Because of updatePassword is almost same as updateUserData, we will combine both of them with updateSettings. And we will keep updateUserData just for reference as commented out
// export const updateUserData = async (name, email) => {

//     try {
//         const res = await axios({
//             method: 'PATCH',
//             url: 'http://127.0.0.1:3000/api/v1/users/updateMe',
//             data: {
//                 name,
//                 email
//             }
//         });
//         showAlert('success', res);

//         if (res.data.status === 'success')
//             showAlert('success', 'Data updated succesfully!');

//     } catch (err) {
//         showAlert('error', err.response.data.message);
//     }

// };

export const updateSettings = async (data, type) => {

    try {
        const url =
            type === 'password' ?
            'http://127.0.0.1:3000/api/v1/users/updateMyPassword' :
            'http://127.0.0.1:3000/api/v1/users/updateMe';

        const res = await axios({
            method: 'PATCH',
            url,
            data
        });

        if (res.data.status === 'success')
            showAlert('success', `${type.toUpperCase()} updated succesfully!`);

    } catch (err) {
        showAlert('error', err.response.data.message);
    }

};