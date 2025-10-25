# app/models/concerns/user_cacheable.rb

module UserCacheable
  extend ActiveSupport::Concern

  included do
    after_update :invalidate_user_cache
    after_destroy :invalidate_user_cache
  end

  class_methods do
    def find_cached(id, expires_in: 1.hour)
      Rails.cache.fetch("user/#{id}", expires_in: expires_in) do
        find(id)
      end
    end

    def all_cached(expires_in: 2.hours)
      Rails.cache.fetch("users/all", expires_in: expires_in) do
        all.to_a
      end
    end

    def admins_cached(expires_in: 2.hours)
      Rails.cache.fetch("users/admin", expires_in: expires_in) do
        where(role: :admin).to_a
      end
    end

    def sales_cached(expires_in: 2.hours)
      Rails.cache.fetch("users/sales", expires_in: expires_in) do
        where(role: :sales).to_a
      end
    end

    def by_role_cached(role, expires_in: 2.hours)
      return all_cached if role.blank?

      Rails.cache.fetch("users/by_role/#{role}", expires_in: expires_in) do
        by_role(role).to_a
      end
    end

    def find_by_email_cached(email, expires_in: 1.hour)
      return nil if email.blank?

      Rails.cache.fetch("user/email/#{email}", expires_in: expires_in) do
        find_by_email(email)
      end
    end

    def clear_all_cache
      Rails.cache.delete_matched("user*")
      Rails.cache.delete_matched("api/v1/user*")
    end
  end

  private

  def invalidate_user_cache
    Rails.cache.delete("user/#{id}")
    Rails.cache.delete("user/email/#{email}")
    self.class.clear_all_cache
  end
end
