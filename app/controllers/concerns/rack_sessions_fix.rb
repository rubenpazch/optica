module RackSessionsFix
  extend ActiveSupport::Concern

  class FakeRackSession < Hash
    def enabled?
      false
    end

    def destroy
      clear
    end
  end

  included do
    before_action :set_fake_session

    private

    def set_fake_session
      request.env["rack.session"] ||= FakeRackSession.new
    end
  end
end
