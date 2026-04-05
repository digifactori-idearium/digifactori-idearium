-- CreateTable
CREATE TABLE "VoxelModel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'New Voxel Model',
    "model" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VoxelModel_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "VoxelModel" ADD CONSTRAINT "VoxelModel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
