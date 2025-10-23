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
    },
    PROJECTS:{
        GET_ALL: '/projects',
        CREATE: '/projects',
        GET_SINGLE : '/projects/{project_id}',
        UPDATE : '/projects/{project_id}',
        DELETE : '/projects/{project_id}'
    },
    TIMESHEET : {
        GET_ALL: '/timesheet/project/{timesheet_id}',
        CREATE: '/timesheet',
        GET_SINGLE : '/timesheet/{timesheet_id}',
        UPDATE : '/timesheet/{timesheet_id}',
        DELETE : '/timesheet/{timesheet_id}'
    }

}