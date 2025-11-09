# Hi this is an HR application

# Note

The existing codebase was implemented using **Firestore** as the backend service.  
However, we are now **migrating away from Firestore** and will be building **REST API services** that use **PostgreSQL** as the primary database.

## Required Updates

1. **Create REST API Services**

   - Implement API services that interact with **PostgreSQL** data.
   - Replace all Firestore-related logic with REST-based endpoints.

2. **Feature Flag for Backend Switching**
   - Introduce a **feature flag mechanism** that allows switching between different API services.
   - Example:
     - If the application is configured to use Firestore → it should use existing Firestore service implementations.
     - If configured to use PostgreSQL → it should use the new REST API services.
   - The selection can be controlled via:
     - A configuration file (e.g., `environment.ts`)
     - Or a CLI command that sets the preferred backend.

## Example

```bash
# To switch backend to Firestore
npm run config:firestore

# To switch backend to PostgreSQL
npm run config:postgres
```

# Build Pipeline

- push to dev: dev will be live

## Application Details

# SuperAdmin

- who is head of company, can access everything

# User

- can be anyone., based on required permissions can access the application. user will be divided based on role.

# Guest

- who is just a guest, can be visitor, or just can view how application works. a limited to customized access provided, with customized time

# Screens

- login, forgot password, profile, settings
- home, to do(onboarding), attendence, leaves, documents, payscale
- employee list, employee page, role creation(like employee, manager etc.), permission management, payscale data

# Roles

- reporting manager etc. custom roles with custom permissions

# Screen Details

- login, forgot password: are same for everyone.
- profile: limited data visible based on role
- settings: limited data, edit options provided based on role
- home: same for everyone, respective data will be provoded based on role, it includes announcements, attendance, leaves and other links.
- to do: It can be onboarding page or feedback page or task to be done page based on role, and guest user with allowed permissions
- attendence: same for everyone, based on role can have more access like approval if role is manager etc., complete attendace, regularization. and shift allotments
- leaves: same for everyone. based on role can have more access like approval of leave., complete holidays list, leave list etc. leave creation.
- documents: same for everyone, based on role can access the documents.
- payscale: same for everyone, based on role can limited data provided. guest user payscale allowed with permission.
- employee list: total employee list, data provided based on permission,
- employee page: based on role can access, employee creation and can modify the payscale, shift, etc.
- role creation: customized role can be created by the super admin or respective role.
- permission management: based on role can be accessed. for modifying or adding new permissions.
- payscale data: based on role allows to view all payscales.
