-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'ADMIN');
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');
CREATE TYPE "TestStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ENDED');
CREATE TYPE "Verdict" AS ENUM ('PENDING', 'AC', 'WA', 'TLE', 'MLE', 'RE', 'CE');

-- CreateTable colleges
CREATE TABLE "colleges" (
    "id"        TEXT NOT NULL,
    "name"      TEXT NOT NULL,
    "code"      TEXT NOT NULL,
    "address"   TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "colleges_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "colleges_code_key" ON "colleges"("code");

-- CreateTable users
CREATE TABLE "users" (
    "id"               TEXT NOT NULL,
    "email"            TEXT NOT NULL,
    "password"         TEXT NOT NULL,
    "name"             TEXT NOT NULL,
    "role"             "Role" NOT NULL DEFAULT 'STUDENT',
    "rollNumber"       TEXT,
    "department"       TEXT,
    "year"             TEXT,
    "phone"            TEXT,
    "bio"              TEXT,
    "avatar"           TEXT,
    "employeeId"       TEXT,
    "leetcodeHandle"   TEXT,
    "hackerrankHandle" TEXT,
    "githubHandle"     TEXT,
    "codeforcesHandle" TEXT,
    "linkedinUrl"      TEXT,
    "resumeUrl"        TEXT,
    "portfolioUrl"     TEXT,
    "totalSolved"      INTEGER NOT NULL DEFAULT 0,
    "easySolved"       INTEGER NOT NULL DEFAULT 0,
    "mediumSolved"     INTEGER NOT NULL DEFAULT 0,
    "hardSolved"       INTEGER NOT NULL DEFAULT 0,
    "leetcodeRank"     INTEGER,
    "contestRating"    DOUBLE PRECISION,
    "streak"           INTEGER NOT NULL DEFAULT 0,
    "testsCompleted"   INTEGER NOT NULL DEFAULT 0,
    "avgScore"         DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalScore"       INTEGER NOT NULL DEFAULT 0,
    "rank"             INTEGER,
    "collegeId"        TEXT,
    "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"        TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_email_key"      ON "users"("email");
CREATE UNIQUE INDEX "users_rollNumber_key" ON "users"("rollNumber");
CREATE UNIQUE INDEX "users_employeeId_key" ON "users"("employeeId");

-- CreateTable assessments
CREATE TABLE "assessments" (
    "id"          TEXT NOT NULL,
    "title"       TEXT NOT NULL,
    "subject"     TEXT,
    "description" TEXT,
    "duration"    INTEGER NOT NULL,
    "maxScore"    INTEGER NOT NULL DEFAULT 0,
    "startDate"   TIMESTAMP(3) NOT NULL,
    "endDate"     TIMESTAMP(3) NOT NULL,
    "language"    TEXT NOT NULL DEFAULT 'multiple',
    "proctored"   BOOLEAN NOT NULL DEFAULT false,
    "status"      "TestStatus" NOT NULL DEFAULT 'DRAFT',
    "createdById" TEXT NOT NULL,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,
    CONSTRAINT "assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable questions
CREATE TABLE "questions" (
    "id"           TEXT NOT NULL,
    "title"        TEXT NOT NULL,
    "description"  TEXT NOT NULL,
    "difficulty"   "Difficulty" NOT NULL DEFAULT 'MEDIUM',
    "marks"        INTEGER NOT NULL DEFAULT 10,
    "timeLimit"    INTEGER NOT NULL DEFAULT 1000,
    "memoryLimit"  INTEGER NOT NULL DEFAULT 256,
    "constraints"  TEXT,
    "order"        INTEGER NOT NULL DEFAULT 0,
    "assessmentId" TEXT NOT NULL,
    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable test_cases
CREATE TABLE "test_cases" (
    "id"         TEXT NOT NULL,
    "input"      TEXT NOT NULL DEFAULT '',
    "output"     TEXT NOT NULL DEFAULT '',
    "hidden"     BOOLEAN NOT NULL DEFAULT false,
    "questionId" TEXT NOT NULL,
    CONSTRAINT "test_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable submissions
CREATE TABLE "submissions" (
    "id"            TEXT NOT NULL,
    "code"          TEXT NOT NULL,
    "language"      TEXT NOT NULL,
    "verdict"       "Verdict" NOT NULL DEFAULT 'PENDING',
    "score"         INTEGER NOT NULL DEFAULT 0,
    "executionTime" DOUBLE PRECISION,
    "memoryUsed"    DOUBLE PRECISION,
    "studentId"     TEXT NOT NULL,
    "assessmentId"  TEXT NOT NULL,
    "questionId"    TEXT,
    "submittedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable submission_results
CREATE TABLE "submission_results" (
    "id"           TEXT NOT NULL,
    "passed"       BOOLEAN NOT NULL,
    "input"        TEXT,
    "expected"     TEXT,
    "actual"       TEXT,
    "time"         DOUBLE PRECISION,
    "hidden"       BOOLEAN NOT NULL DEFAULT false,
    "submissionId" TEXT NOT NULL,
    CONSTRAINT "submission_results_pkey" PRIMARY KEY ("id")
);

-- AddForeignKeys
ALTER TABLE "users"              ADD CONSTRAINT "users_collegeId_fkey"              FOREIGN KEY ("collegeId")    REFERENCES "colleges"("id")     ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "assessments"        ADD CONSTRAINT "assessments_createdById_fkey"       FOREIGN KEY ("createdById")  REFERENCES "users"("id")        ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "questions"          ADD CONSTRAINT "questions_assessmentId_fkey"        FOREIGN KEY ("assessmentId") REFERENCES "assessments"("id")  ON DELETE CASCADE  ON UPDATE CASCADE;
ALTER TABLE "test_cases"         ADD CONSTRAINT "test_cases_questionId_fkey"         FOREIGN KEY ("questionId")   REFERENCES "questions"("id")    ON DELETE CASCADE  ON UPDATE CASCADE;
ALTER TABLE "submissions"        ADD CONSTRAINT "submissions_studentId_fkey"         FOREIGN KEY ("studentId")    REFERENCES "users"("id")        ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "submissions"        ADD CONSTRAINT "submissions_assessmentId_fkey"      FOREIGN KEY ("assessmentId") REFERENCES "assessments"("id")  ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "submissions"        ADD CONSTRAINT "submissions_questionId_fkey"        FOREIGN KEY ("questionId")   REFERENCES "questions"("id")    ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "submission_results" ADD CONSTRAINT "submission_results_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
