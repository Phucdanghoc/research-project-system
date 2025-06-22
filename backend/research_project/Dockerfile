FROM ruby:3.3.5-slim

WORKDIR /rails

# Install build tools and libraries
RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends \
      build-essential \
      libpq-dev \
      curl \
      nodejs \
      yarn \
    && rm -rf /var/lib/apt/lists/*

# Now proceed with your Gem installation
COPY Gemfile Gemfile.lock ./
RUN bundle install
# Then copy the rest of your application
COPY . .

# RUN rake db:create
# RUN rake db:migrate

# Set entrypoint script
# ENTRYPOINT ["./entrypoint.sh"]
CMD ["bundle", "exec", "rails", "server","-b", "0.0.0.0","-p","3000"]
