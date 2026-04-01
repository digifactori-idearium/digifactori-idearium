-- CreateTable
CREATE TABLE "IdeoramaLikes" (
    "userId" TEXT NOT NULL,
    "ideoramaId" TEXT NOT NULL,

    CONSTRAINT "IdeoramaLikes_pkey" PRIMARY KEY ("ideoramaId","userId")
);

-- AddForeignKey
ALTER TABLE "IdeoramaLikes" ADD CONSTRAINT "IdeoramaLikes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdeoramaLikes" ADD CONSTRAINT "IdeoramaLikes_ideoramaId_fkey" FOREIGN KEY ("ideoramaId") REFERENCES "Ideorama"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
