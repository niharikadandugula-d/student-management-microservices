from pydantic import BaseModel, ConfigDict, Field


class CourseCreate(BaseModel):
    title: str = Field(min_length=2, max_length=150)
    description: str = Field(default="", max_length=2000)
    instructor: str = Field(min_length=2, max_length=100)
    duration: str = Field(min_length=1, max_length=50)


class CourseUpdate(BaseModel):
    title: str = Field(min_length=2, max_length=150)
    description: str = Field(default="", max_length=2000)
    instructor: str = Field(min_length=2, max_length=100)
    duration: str = Field(min_length=1, max_length=50)


class CourseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    instructor: str
    duration: str
