## SETUP DATA BASE

### Installation

- Windows:

  Download installer from [postgresql](postgresql.org)
  Ajoute dans la variable d'enviroment

- macOS (using Homebrew):

```shell
brew install postgresql
brew services start postgresql
```

And continue the installation process

### PostgreSQL Database Creation and app setup

- Go to terminal and connect

```shell
  psql -U postgres
```

- Enter the passowrd you create during installation (you will use the same password in the **DATABASE_URL**)

- Greate database with this commande

```shell
CREATE DATABASE idearium;
```

- Add the DATABASE URL IN THE ENV FILE `.env`

```shell
DATABASE_URL=postgresql://username:password@host:port/database?schema=public #this is just the structure
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/idearium?schema=public" #copy this and replace with your password
```

- List all database to check if you create

```shell
\l
```

- connect to a particulare database to check if you create (Optional if you want to make sql queries)

```shell
\c databasename #an example
\c idearium
```

- Others

```shell
\l                        -- List all databases
\l+                       -- List databases with details
\c database_name         -- Connect to another database
\dt                      -- List tables in current database
\dt+                     -- List tables with details
\d table_name            -- Describe table structure
\d+ table_name           -- Describe table with more details
\du                      -- List users/roles
\dn                      -- List schemas
```

- Execute SQL QUERIES (Optional)

```shell
SELECT * from user
```

### Define Your Data Model

```sql
// prisma/schema.prisma
// Example
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

// User model
model User {
  id        Int      @id @default(cuid()) //id
  email     String   @unique //  all unique field
  name      String?  //question mark means optional
  age       Int?
  role      Role     @default(USER)
  posts     Post[]   // One-to-many relation
  profile   Profile? // One-to-one relation
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users") // Custom table name
}

// Post model
model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
  tags      String[]
  views     Int      @default(0)
  createdAt DateTime @default(now())

  @@index([authorId]) // Create index
}

// Profile model (One-to-one)
model Profile {
  id     Int    @id @default(autoincrement())
  bio    String?
  userId Int    @unique
  user   User   @relation(fields: [userId], references: [id])
}

// Enum example
enum Role {
  USER
  ADMIN
  MODERATOR
}
```

### Basic Client Setup

```js
// config/prisma.config.ts - Singleton pattern recommended
import { PrismaClient } from '@prisma/client'

class Database {
  private static instance: PrismaClient

  static getInstance(): PrismaClient {
    if (!Database.instance) {
      Database.instance = new PrismaClient({
        log: ['query', 'info', 'warn', 'error'], // Optional logging
          datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
      })
    }
    return Database.instance
  }
}

export const prisma = Database.getInstance()
```

### Service/Repository Pattern

```js
// services/UserService.ts
import { prisma } from '../lib/prisma'

const userTable = prisma.user;

export class UserService {
  // Create user
  async createUser(data: { email: string; name?: string; age?: number }) {
    return await userTable.create({
      data,
      select: {
        id: true,
        email: true,
        name: true,
      }
    })
  }

  // Find user by email
  async findUserByEmail(email: string) {
    return await userTable.findUnique({
      where: { email },
      include: {
        rooms: true,
        profile: true,
      }
    })
  }

  // Update user
  async updateUser(id: number, data: Partial<{ name: string; age: number }>) {
    return await userTable.update({
      where: { id },
      data,
    })
  }

  // Delete user
  async deleteUser(id: number) {
    return await userTable.delete({
      where: { id },
    })
  }

  // Get all users with pagination
  async getAllUsers(skip: number = 0, take: number = 10) {
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count()
    ])

    return { users, total, page: Math.floor(skip / take) + 1 }
  }
}
```

### Migrations with Prisma

#### Local / Dans ton repo en local

Every you change anyting, or any model in the `schema.prisma` file

```shell
# Create a new migration
npx prisma migrate dev --name "init" # pour la premiere foi apres la creation de la base de donnee
# or with description
npx prisma migrate dev --name "add_user_profile_relation"
npx prisma generate #Generate the prisma client for tables and typing access
```

#### Produton

```shell
# 1. Create migration (development)
npx prisma migrate dev --name "add_new_feature"

# 2. Check migration status
npx prisma migrate status

# 3. Apply migrations (production)
npx prisma migrate deploy

# 4. Generate/regenerate Prisma Client
npx prisma generate
```
