FROM continuumio/miniconda3
LABEL maintainer="cianmckenna"


ENV PYTHONBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=geodjango_tutorial.settings

RUN mkdir -p /app
WORKDIR /app

COPY ENV.yml .

# Add the conda-forge channel -> fix for whitenoise missing
RUN conda config --add channels conda-forge
RUN conda env create -f ENV.yml

# RUN command should use the new environment
SHELL [ "conda", "run", "-n", "awm_geo", "/bin/bash", "-c" ]

# Install pip-only dependencies
RUN pip install django-rest-knox

RUN echo "conda activate awm_geo" >> ~/.bashrc
SHELL ["/bin/bash", "--login", "-c"]

# Copy everything in your Django project to the image.

COPY . /app
ENV PYTHONPATH="/app"

# The code to run when container is started:
COPY manage.py .

ENTRYPOINT ["conda", "run", "--no-capture-output", "-n", "awm_geo"]


# EXPOSE the port that container will operate on 
EXPOSE 8001

# SHELL [ "python", "manage.py", "createsuperuser" ]
# Finally, start the server
CMD [ "python", "manage.py", "runserver", "0.0.0.0:8001" ]

