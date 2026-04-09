// pages/TestFormPage.tsx
import {
  Mail,
  Lock,
  User,
  Phone,
  Calendar,
  Globe,
  DollarSign,
  BookOpen,
} from 'lucide-react';
import React from 'react';
import { SubmitHandler, FieldValues } from 'react-hook-form';

import { Form, FormInputData } from '@/components/common/form';

const TestFormPage: React.FC = () => {
  // Define all input types for testing
  const formInputs: FormInputData[] = [
    // Text Inputs
    {
      name: 'fullName',
      label: 'Full Name',
      type: 'text',
      placeholder: 'Enter your full name',
      required: true,
      icon: User,
    },
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      placeholder: 'john.doe@example.com',
      required: true,
      icon: Mail,
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      placeholder: 'Enter your password',
      required: true,
      icon: Lock,
    },
    {
      name: 'phone',
      label: 'Phone Number',
      type: 'tel',
      placeholder: '+1 (555) 123-4567',
      required: true,
      icon: Phone,
    },
    {
      name: 'website',
      label: 'Personal Website',
      type: 'url',
      placeholder: 'https://example.com',
      required: false,
      icon: Globe,
    },

    // Number Inputs
    {
      name: 'age',
      label: 'Age',
      type: 'number',
      placeholder: 'Enter your age',
      required: true,
      icon: Calendar,
    },
    {
      name: 'salary',
      label: 'Annual Salary',
      type: 'salary',
      placeholder: 'Enter your salary',
      required: true,
      icon: DollarSign,
    },

    // Textarea
    {
      name: 'bio',
      label: 'Biography',
      type: 'textarea',
      placeholder: 'Tell us about yourself, your experience, and interests...',
      required: false,
      icon: BookOpen,
    },

    // Select Dropdown
    {
      name: 'country',
      label: 'Country',
      type: 'select',
      placeholder: 'Select your country',
      icon: BookOpen,
      required: true,
      options: [
        { value: 'us', text: 'United States' },
        { value: 'ca', text: 'Canada' },
        { value: 'uk', text: 'United Kingdom' },
        { value: 'au', text: 'Australia' },
        { value: 'de', text: 'Germany' },
        { value: 'fr', text: 'France' },
        { value: 'jp', text: 'Japan' },
        { value: 'br', text: 'Brazil' },
      ],
    },

    // Single Checkbox
    {
      name: 'terms',
      label: 'Terms and Conditions',
      type: 'checkbox',
      placeholder: 'I agree to the terms and conditions',
      required: true,
    },
    {
      name: 'newsletter',
      label: 'Newsletter Subscription',
      type: 'checkbox',
      placeholder: 'Subscribe to our newsletter',
      required: false,
    },

    // Radio Buttons
    {
      name: 'gender',
      label: 'Gender',
      type: 'radio',
      required: true,
      options: [
        { value: 'male', text: 'Male' },
        { value: 'female', text: 'Female' },
        { value: 'other', text: 'Other' },
        { value: 'prefer-not', text: 'Prefer not to say' },
      ],
    },

    {
      name: 'experienceLevel',
      label: 'Experience Level',
      type: 'radio',
      required: true,
      options: [
        { value: 'entry', text: 'Entry Level (0-2 years)' },
        { value: 'mid', text: 'Mid Level (3-5 years)' },
        { value: 'senior', text: 'Senior Level (6-9 years)' },
        { value: 'lead', text: 'Lead/Manager (10+ years)' },
      ],
    },

    // Checkbox Group
    {
      name: 'interests',
      label: 'Interests (Select all that apply)',
      type: 'checkbox-group',
      required: false,
      options: [
        { value: 'technology', text: 'Technology' },
        { value: 'design', text: 'Design' },
        { value: 'marketing', text: 'Marketing' },
        { value: 'sales', text: 'Sales' },
        { value: 'development', text: 'Development' },
        { value: 'management', text: 'Management' },
      ],
    },

    {
      name: 'skills',
      label: 'Skills',
      type: 'checkbox-group',
      required: true,
      options: [
        { value: 'javascript', text: 'JavaScript/TypeScript' },
        { value: 'react', text: 'React' },
        { value: 'node', text: 'Node.js' },
        { value: 'python', text: 'Python' },
        { value: 'java', text: 'Java' },
        { value: 'sql', text: 'SQL' },
        { value: 'aws', text: 'AWS' },
        { value: 'docker', text: 'Docker' },
      ],
    },

    // File Upload
    {
      name: 'resume',
      label: 'Resume/CV',
      type: 'file',
      placeholder: 'Upload your resume (PDF, DOC)',
      required: true,
    },
    {
      name: 'profilePicture',
      label: 'Profile Picture',
      type: 'image',
      placeholder: 'Upload a profile picture',
      required: false,
    },
  ];

  // Handle form submission
  const handleSubmit: SubmitHandler<FieldValues> = data => {
    console.log('Form submitted with data:', data);

    // Show success message
    alert('Form submitted successfully! Check console for data.');

    // You can also send to an API
    // fetch('/api/submit', {
    //   method: 'POST',
    //   body: JSON.stringify(data),
    //   headers: { 'Content-Type': 'application/json' }
    // });
  };

  // Sample initial values for testing edit mode
  const sampleInitialValues = {
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    age: 30,
    country: 'us',
    gender: 'male',
    experienceLevel: 'mid',
    interests: {
      technology: true,
      design: true,
    },
    skills: {
      javascript: true,
      react: true,
      node: true,
    },
    terms: true,
    newsletter: true,
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="magic-text text-3xl font-bold text-gray-900 mb-2">
            Complete Form Test Page
          </h1>
          <p className="text-gray-600">
            Testing all input types: text, email, password, tel, url, number,
            salary, textarea, select, checkbox, radio, checkbox-group, and file
            uploads
          </p>
        </div>

        {/* Form Count Badge */}
        <div className="mb-4 flex justify-end">
          <span className=" text-blue-800 text-sm font-medium px-4 py-2 rounded-full">
            Total Fields: {formInputs.length}
          </span>
        </div>

        {/* Form with all inputs */}
        <div className="rounded-lg shadow-lg p-6">
          <Form
            inputs={formInputs}
            handleOnSubmit={handleSubmit}
            loading={false}
            // Uncomment to test with initial values
            initialValues={sampleInitialValues}
          />
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">
            📝 Testing Instructions:
          </h3>
          <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
            <li>
              Try submitting without filling required fields to see validation
            </li>
            <li>Test email validation with invalid emails</li>
            <li>Test password minimum length (4 characters)</li>
            <li>Test phone number format validation</li>
            <li>Test URL format validation</li>
            <li>Test age limits (min 18, max 100)</li>
            <li>Test salary must be a number</li>
            <li>Test file uploads with different file types</li>
            <li>Check console.log for submitted form data</li>
          </ul>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-3 text-center shadow">
            <div className="text-2xl font-bold text-blue-600">6</div>
            <div className="text-xs text-gray-600">Text Inputs</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow">
            <div className="text-2xl font-bold text-green-600">2</div>
            <div className="text-xs text-gray-600">Number Inputs</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow">
            <div className="text-2xl font-bold text-purple-600">1</div>
            <div className="text-xs text-gray-600">Textarea</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow">
            <div className="text-2xl font-bold text-orange-600">1</div>
            <div className="text-xs text-gray-600">Select</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow">
            <div className="text-2xl font-bold text-red-600">4</div>
            <div className="text-xs text-gray-600">Checkboxes</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow">
            <div className="text-2xl font-bold text-indigo-600">2</div>
            <div className="text-xs text-gray-600">Radio Groups</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow">
            <div className="text-2xl font-bold text-pink-600">2</div>
            <div className="text-xs text-gray-600">Checkbox Groups</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow">
            <div className="text-2xl font-bold text-teal-600">2</div>
            <div className="text-xs text-gray-600">File Uploads</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestFormPage;
