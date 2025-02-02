const jobLogs = [];

export const JobLogger = {
  record(jobType, companyId, executeAt) {
    jobLogs.push({
      jobType,
      companyId,
      scheduledAt: new Date(),
      executeAt,
      status: "SCHEDULED"
    });
  },
  
  getLogs() {
    return [...jobLogs];
  }
};