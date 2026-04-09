import { Form } from '@/components/common/form';

interface Props {
  initialValues: any;
  onSubmit: (data: any) => void;
}

const ProfileForm: React.FC<Props> = ({ initialValues, onSubmit }) => {
  return (
    <div className="lg:4/6 md:w-3/6 w-full p-3">
      <Form
        inputs={[
          { label: 'Pseudo', type: 'text', name: 'pseudo', required: true },
          { label: 'Bio', type: 'textarea', name: 'bio' },
        ]}
        initialValues={initialValues}
        handleOnSubmit={onSubmit}
      />
    </div>
  );
};

export default ProfileForm;
