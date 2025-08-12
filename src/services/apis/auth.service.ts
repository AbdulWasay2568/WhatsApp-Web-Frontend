import { apiClient } from './axios';
import { RegisterUserDto, LoginUserDto } from '../../interfaces/auth.interface'; 
import {jwtDecode} from "jwt-decode";

interface JwtPayload {
  id: string; // Or number if backend sends it as number
  // You can include more fields if needed (exp, email, role, etc.)
}


// Type guard to check if error is an AxiosError
function isAxiosError(error: unknown): error is { response: { data: { message: string } } } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: { data?: { message?: unknown } } }).response?.data?.message === 'string'
  );
}

// Inside your service
export const registerUser = async (data: RegisterUserDto) => {
  try {
    const response = await apiClient.post('/auth/register', JSON.stringify(data));
    return response.data; 
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      console.error('Error during registration:', error.response.data.message); // Access safely
      throw new Error(error.response.data.message); // Re-throw the detailed error
    } else {
      console.error('Unexpected error:', error); // Handle non-Axios errors
      throw new Error('An unexpected error occurred during registration.');
    }
  }
};

// Function to log in a user

export const loginUser = async (data: LoginUserDto) => {
  const response = await apiClient.post('/auth/login', data);
  const { token } = response.data;

  if (!token) {
    throw new Error("No token received from server");
  }

  const decoded = jwtDecode<JwtPayload>(token);

  return {
    token,
    userId: decoded.id,
    // optionally add more fields: email, exp, etc.
  };
};

//Function to fetch user profile or data if needed
export const fetchUserProfile = async (userID: number) => {
  try {
    const response = await apiClient.get(`/users/${userID}`);
    return response.data; // Contains user profile data
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error; 
  }
};
