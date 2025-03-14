# Cloud Pet
Cloud Pet is a virtual pet platform powered by the cloud that allows users to adopt and care for pets. Name your pet, and keep it fed, clean, and well-rested!

## Local Setup
The Cloud Pet client WebApp can be deployed and run locally, assuming the required AWS services and environment variables are configured.

### Environment Variables
Before running, the environment variables must be set in a root `.env.local` file with the following secrets:

```env
COGNITO_CLIENT_ID=your-cognito-client-id
COGNITO_CLIENT_SECRET=your-cognito-client-secret
COGNITO_ISSUER=https://cognito-idp.{region}.amazonaws.com/{user-pool-id}
NEXTAUTH_SECRET=your-secure-secret
NEXTAUTH_URL=http://localhost:3000 # The deployed domain, this is default for local
```

### Node Modules
Install the required node packages using `npm` or a similar package manager in the project directory. 

```bash
npm install
# or
pnpm install
```

### Running
Run the project locally using `npm` or a similar tool.

Open [http://localhost:3000](http://localhost:3000) (or whatever domain you used) with your browser to see the locally running client.

```bash
npm run dev
# or
pnpm dev
```

## Example Usage
### Before Sign-In
<img width="1280" alt="image" src="https://github.com/user-attachments/assets/37e8f712-6b88-44d8-855f-6f97bfad5726" />

### After Sign-In
<img width="1280" alt="image" src="https://github.com/user-attachments/assets/fda3f736-7aef-44c8-b7b0-776a0292c8a7" />

### Dashboard Before Creating Pets
<img width="1264" alt="image" src="https://github.com/user-attachments/assets/bc7d1a64-c232-4dc7-84c4-07a783e6b641" />

### After Creating Two Pets
<img width="1262" alt="image" src="https://github.com/user-attachments/assets/9a56f8a6-75a8-47c6-8ebb-638558dce766" />
