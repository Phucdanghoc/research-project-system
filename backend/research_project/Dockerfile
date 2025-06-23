FROM ruby:3.3.5-slim

RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends \
      build-essential \
      libpq-dev \
      curl \
      nodejs \
      yarn \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /rails

COPY Gemfile Gemfile.lock ./
RUN bundle install

COPY . .

EXPOSE 3000

CMD ["bash", "-c", "bundle exec rails db:create db:migrate && bundle exec rails server -b 0.0.0.0 -p 3000"]
