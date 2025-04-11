# Curiosity Report

## Topic AWS Cloudwatch/Billing/Customer Service

For my curiosity report I investigated an overcharge on my AWS account by $630.

I first found out about the bill on April 1, when I received an invoice for March. I was shocked to get such a large bill and went on to AWS as soon as I saw my email notification. I had been charged $630 for using cloudWatch, an AWS resource I did not know I was using (it was not mentioned in the class, except for not allowing advanced logs on ECR -- which I had not enabled). After further investigation I found that I had been charged this much for transferring over 1TB of data across 7 days in March. The amount of data increased drastically day to day.

Upon researching cloudWatch I discoverd that the data I was charged for was due to my service console logs. It turns out I had been console logging my metrics when they failed to send to grafana. These metrics were being sent every 1s and were failing more often then not. Not only was the metric console logging frequent, but it was also massive in length, due to the fact that I had been keeping a map of [invalidEndpointPath: callCount] which had grown massive due to the large number of bots hitting my website.

In the end I was able to get a refund from Amazon after submitting a case and talking to a service rep. The service rep asked about if I was a university student, working on a university project, and if the course required use of AWS. He then asked for a picture of my school ID (he accepted my 1.5 year past expired ID). The service rep then submitted an internal ticket and after several days I finally received a refund?

In the end I learned about Cloudwatch and the importance of limiting console logging as well as how to use AWS customer service and Billing services to investigate charges and set up a budget.
