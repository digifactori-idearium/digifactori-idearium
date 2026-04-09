import { DataTable } from '../global/data-table/dataTable';

import { columns } from './usersColumns';

function getData(): Profile[] {
  return [
    {
      id: 'u1',
      userId: 'alice01',
      pseudo: 'Alice',
      bio: 'Je suis Alice',
      avatar: 'alice@example.com',
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-06-01'),
    },
    {
      id: 'u2',
      userId: 'bob02',
      pseudo: 'Bob',
      bio: 'Je suis Bob',
      avatar: 'bob@example.com',
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-06-01'),
    },
    {
      id: 'u3',
      userId: 'feuille03',
      pseudo: 'Feuille',
      bio: 'Je suis Feuille',
      avatar: 'feuille@example.com',
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-06-01'),
    },
    {
      id: 'u4',
      userId: 'teams04',
      pseudo: 'Teams',
      bio: 'Je suis Teams',
      avatar: 'teams@example.com',
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-06-01'),
    },
    {
      id: 'u5',
      userId: 'cinq05',
      pseudo: 'Cinq',
      bio: 'Je suis Cinq',
      avatar: 'cinq@example.com',
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-06-01'),
    },
    {
      id: 'u6',
      userId: 'oslo06',
      pseudo: 'Oslo',
      bio: 'Je suis Oslo',
      avatar: 'oslo@example.com',
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-06-01'),
    },
    {
      id: 'u7',
      userId: 'patrick07',
      pseudo: 'Patrick',
      bio: 'Je suis Patrick',
      avatar: 'patrick@example.com',
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-06-01'),
    },
    {
      id: 'u8',
      userId: 'sandy08',
      pseudo: 'sandy',
      bio: 'Je suis Sandy',
      avatar: 'sandy@example.com',
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-06-01'),
    },
    {
      id: 'u9',
      userId: 'carlo09',
      pseudo: 'carlo',
      bio: 'Je suis Carlo',
      avatar: 'carlo@example.com',
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-06-01'),
    },
    {
      id: 'u10',
      userId: 'crabs10',
      pseudo: 'crabs',
      bio: 'Je suis Crabs',
      avatar: 'crabs@example.com',
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-06-01'),
    },
    {
      id: 'u11',
      userId: 'spa11',
      pseudo: 'Pingui',
      bio: 'Je suis Pingui',
      avatar: 'pingui@example.com',
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-06-01'),
    },
    {
      id: 'u12',
      userId: 'spa12',
      pseudo: 'Spa',
      bio: 'Je suis Spa',
      avatar: 'spa@example.com',
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-06-01'),
    },
    {
      id: 'u13',
      userId: 'tele13',
      pseudo: 'Tele',
      bio: 'Je suis Tele',
      avatar: 'tele@example.com',
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-06-01'),
    },
    {
      id: 'u14',
      userId: 'ideorama02',
      pseudo: 'Ideorama',
      bio: 'Je suis Ideorama',
      avatar: 'ideorama@example.com',
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-06-01'),
    },
  ];
}

export default function userHandling() {
  const data = getData();

  return (
    <div className="w-full min-h-screen p-6">
      <div className="magic-text text-center md:text-5xl text-3xl justify-center flex items-center gap-2 font-bold mb-6">
        Gérez les stagiaires
      </div>
      <div className="container mx-auto py-10">
        <DataTable
          columns={columns}
          data={data}
          filterColumn="avatar"
          filterColumnText="emails"
        />
      </div>
    </div>
  );
}
