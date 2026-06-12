import { AdminDashboardPage, StudentDashboardPage } from '../pages'

export const APP_ROLES = {
  STUDENT: 'student',
  ADMIN: 'admin',
}

export const APP_ROUTES = {
  [APP_ROLES.STUDENT]: {
    key: APP_ROLES.STUDENT,
    title: 'Student',
    component: StudentDashboardPage,
  },
  [APP_ROLES.ADMIN]: {
    key: APP_ROLES.ADMIN,
    title: 'Admin',
    component: AdminDashboardPage,
  },
}
