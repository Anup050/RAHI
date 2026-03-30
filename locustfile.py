from locust import HttpUser, task, between

class RAHIUser(HttpUser):
    wait_time = between(1, 3)

    @task
    def check_homepage(self):
        self.client.get("/")

    # In real scenario, we would login first -> get token -> check backend
    # For now, we test the public health endpoint
    @task(3)
    def check_health(self):
        self.client.get("/docs")
