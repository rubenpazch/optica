# config/initializers/cors.rb
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins "localhost:3000", "localhost:5173", "127.0.0.1:3000", "127.0.0.1:5173"

    resource "*",
      headers: :any,
      methods: [ :get, :post, :put, :patch, :delete, :options, :head ],
      credentials: true
  end

  # For production
  if Rails.env.production? || Rails.env.staging? || Rails.env.edge?
    allow do
      origins /https:\/\/.*\.herokuapp\.com/, /https:\/\/.*\.vercel\.app/

      resource "*",
        headers: :any,
        methods: [ :get, :post, :put, :patch, :delete, :options, :head ],
        credentials: true
    end
  end
end
