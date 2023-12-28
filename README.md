# YellowAI Summarizer

Summarize data from YellowAI CSV, from this format:
```
name,campaignId,reportId,senderId,userId,cdpUserId,templateId,messageId,status,source,smsUnits,scheduledAt,sentAt,deliveredAt,readAt,repliedAt,reply,errorMessage,comments
,apiNotifications,658c1f3a370ae27db4256735,62895363543100,6282111047847,,defi_apps_lto1b,o8IwiWbKv-qnhVWJyu8aS,delivered
...
```

into:
```
Template ID,Source,Failed,Sent,Delivered,Read,Type,Created By,Sender ID
cofi_insurance_1,yellowai,0,0,1,0,UTILITY,whatsapp business manager,'62895363543100
...
```
