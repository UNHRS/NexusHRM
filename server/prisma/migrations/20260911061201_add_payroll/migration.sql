-- CreateEnum
CREATE TYPE "PayrollStatus" AS ENUM ('DRAFT', 'FINALIZED');

-- CreateTable
CREATE TABLE "SalaryStructure" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "basicSalary" DECIMAL(10,2) NOT NULL,
    "allowances" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "effectiveFrom" DATE NOT NULL,

    CONSTRAINT "SalaryStructure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollRun" (
    "id" SERIAL NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "status" "PayrollStatus" NOT NULL DEFAULT 'DRAFT',
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PayrollRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payslip" (
    "id" SERIAL NOT NULL,
    "payrollRunId" INTEGER NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "basicSalary" DECIMAL(10,2) NOT NULL,
    "allowances" DECIMAL(10,2) NOT NULL,
    "workingDays" INTEGER NOT NULL,
    "presentDays" DECIMAL(4,1) NOT NULL,
    "unpaidLeaveDays" DECIMAL(4,1) NOT NULL DEFAULT 0,
    "lateDeduction" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "grossPay" DECIMAL(10,2) NOT NULL,
    "totalDeductions" DECIMAL(10,2) NOT NULL,
    "netPay" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "Payslip_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SalaryStructure_employeeId_key" ON "SalaryStructure"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "PayrollRun_month_year_key" ON "PayrollRun"("month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "Payslip_payrollRunId_employeeId_key" ON "Payslip"("payrollRunId", "employeeId");

-- AddForeignKey
ALTER TABLE "SalaryStructure" ADD CONSTRAINT "SalaryStructure_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payslip" ADD CONSTRAINT "Payslip_payrollRunId_fkey" FOREIGN KEY ("payrollRunId") REFERENCES "PayrollRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payslip" ADD CONSTRAINT "Payslip_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
