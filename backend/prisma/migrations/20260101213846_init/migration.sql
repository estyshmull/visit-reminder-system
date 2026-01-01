BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[admin_users] (
    [id] NVARCHAR(1000) NOT NULL,
    [username] NVARCHAR(1000) NOT NULL,
    [passwordHash] NVARCHAR(1000) NOT NULL,
    [fullName] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [admin_users_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [admin_users_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [admin_users_username_key] UNIQUE NONCLUSTERED ([username])
);

-- CreateTable
CREATE TABLE [dbo].[users] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [phone] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000),
    [notes] NVARCHAR(1000),
    [isActive] BIT NOT NULL CONSTRAINT [users_isActive_df] DEFAULT 1,
    [scheduleType] NVARCHAR(1000) NOT NULL CONSTRAINT [users_scheduleType_df] DEFAULT 'MANUAL',
    [dayOfWeek] INT,
    [frequency] INT,
    [weekOfMonth] INT,
    [startDate] DATETIME2,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [users_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [users_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [users_phone_key] UNIQUE NONCLUSTERED ([phone])
);

-- CreateTable
CREATE TABLE [dbo].[schedules] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [date] DATETIME2 NOT NULL,
    [source] NVARCHAR(1000) CONSTRAINT [schedules_source_df] DEFAULT 'MANUAL',
    [position] INT,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [schedules_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [schedules_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [schedules_userId_date_key] UNIQUE NONCLUSTERED ([userId],[date])
);

-- CreateTable
CREATE TABLE [dbo].[reminder_logs] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [scheduledDate] DATETIME2 NOT NULL,
    [actualSendDate] DATETIME2,
    [attemptNumber] INT NOT NULL CONSTRAINT [reminder_logs_attemptNumber_df] DEFAULT 0,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [reminder_logs_status_df] DEFAULT 'PENDING',
    [isShabbatEarly] BIT NOT NULL CONSTRAINT [reminder_logs_isShabbatEarly_df] DEFAULT 0,
    [userResponse] NVARCHAR(1000) CONSTRAINT [reminder_logs_userResponse_df] DEFAULT 'NO_RESPONSE',
    [responseReceivedAt] DATETIME2,
    [responseKeyPressed] NVARCHAR(1000),
    [apiResponse] NVARCHAR(1000),
    [errorMessage] NVARCHAR(1000),
    [sentAt] DATETIME2,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [reminder_logs_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [reminder_logs_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[ivr_responses] (
    [id] NVARCHAR(1000) NOT NULL,
    [reminderLogId] NVARCHAR(1000) NOT NULL,
    [keyPressed] NVARCHAR(1000) NOT NULL,
    [pressedAt] DATETIME2 NOT NULL,
    [callDuration] INT,
    [yemotCallId] NVARCHAR(1000),
    [rawResponse] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [ivr_responses_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [ivr_responses_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[settings] (
    [id] NVARCHAR(1000) NOT NULL,
    [keyName] NVARCHAR(1000) NOT NULL,
    [value] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000),
    [updatedAt] DATETIME2 NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [settings_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [settings_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [settings_keyName_key] UNIQUE NONCLUSTERED ([keyName])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [users_isActive_idx] ON [dbo].[users]([isActive]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [schedules_date_idx] ON [dbo].[schedules]([date]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [reminder_logs_userId_idx] ON [dbo].[reminder_logs]([userId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [reminder_logs_scheduledDate_idx] ON [dbo].[reminder_logs]([scheduledDate]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [reminder_logs_status_idx] ON [dbo].[reminder_logs]([status]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [ivr_responses_reminderLogId_idx] ON [dbo].[ivr_responses]([reminderLogId]);

-- AddForeignKey
ALTER TABLE [dbo].[schedules] ADD CONSTRAINT [schedules_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[reminder_logs] ADD CONSTRAINT [reminder_logs_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ivr_responses] ADD CONSTRAINT [ivr_responses_reminderLogId_fkey] FOREIGN KEY ([reminderLogId]) REFERENCES [dbo].[reminder_logs]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
