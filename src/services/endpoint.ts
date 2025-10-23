export const API_ENDPOINTS = {
    AUTH: {
        SIGNIN: '/auth/signin',
        SIGNUP: '/auth/signup'
    },
    USERS: {
        GET_ALL: '/user',
        CREATE: '/user',
        GET_SINGLE: '/user/{user_id}',
        UPDATE: '/user/{user_id}',
        DELETE: '/user/{user_id}',
    },
    ROLES: {
        GET_ALL: '/role',
        CREATE: '/role',
        GET_SINGLE : '/role/{role_id}',
        UPDATE : '/role/{role_id}',
        DELETE : '/role/{role_id}'
    },
    CLIENTS: {
        GET_ALL: '/clients',
        CREATE: '/clients',
        GET_SINGLE : '/clients/{client_id}',
        UPDATE : '/clients/{client_id}',
        DELETE : '/clients/{client_id}'
    }

}