class MockTable:
    def __init__(self, name):
        self.name = name
        self.data = []
        if name == "drones" or name == "drone_fleet":
            self.data = [
                {"id": "1", "drone_name": "Alpha-1", "battery": 85, "status": "active"},
                {"id": "2", "drone_name": "Alpha-2", "battery": 92, "status": "deployed"},
                {"id": "3", "drone_name": "Alpha-3", "battery": 45, "status": "maintenance"},
                {"id": "4", "drone_name": "Alpha-4", "battery": 12, "status": "inactive"},
            ]
        elif name == "grid_sectors":
            # 7x7 grid
            self.data = [{"id": f"{r}{c}", "scan_status": "unscanned"} for r in "ABCDEFG" for c in range(1, 8)]

    def select(self, *args, **kwargs):
        return self

    def insert(self, data):
        if isinstance(data, list):
            self.data.extend(data)
        else:
            self.data.append(data)
        return self

    def update(self, data):
        # Mock update logic: just return self
        return self

    def eq(self, column, value):
        # Simple filtering for common use cases
        if column == "scan_status":
            self.data = [d for d in self.data if d.get("scan_status") == value]
        elif column == "id" or column == "drone_name":
            self.data = [d for d in self.data if d.get("id") == value or d.get("drone_name") == value]
        return self

    def limit(self, n):
        self.data = self.data[:n]
        return self

    def execute(self):
        class MockResponse:
            def __init__(self, data):
                self.data = data
        return MockResponse(self.data)

class MockSupabase:
    def table(self, name):
        return MockTable(name)

def get_supabase():
    return MockSupabase()
